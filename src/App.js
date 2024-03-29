import React, { useState } from "react";
import FileUpload from "./FileUpload";
import {
  Button,
  Input,
  Textarea,
  Center,
  Text,
  Heading,
  useToast,
  Container,
  Link,
} from "@chakra-ui/react";

function App() {
  const [script, setScript] = useState("");
  //const [summaryPoints, setSummaryPoints] = useState([]);
  //const [fileContents, setFileContents] = useState("");
  const [input, setInput] = useState("");
  const [title, setTitle] = useState("");
  const [presId, setPresId] = useState("");

  let url =
    "https://docs.google.com/presentation/d/" + presId + "/edit#slide=id.p";

  //only works for txt files
  const handleFileUploaded = (file) => {
    const reader = new FileReader();

    reader.onload = () => {
      const contents = reader.result;
      setScript(contents);
    };

    reader.readAsText(file);
  };

  const handleChange = (event) => {
    setInput(event.target.value);
    setScript(event.target.value);
  };

  const handleChangeTitle = (event) => {
    setTitle(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setScript(event.target.value);
    setInput("");
    setTitle("");
    handleSummarize();
  };

  const handlePaste = (event) => {
    const pastedText = event.clipboardData.getData("text");
    const newValue =
      input.substring(0, event.target.selectionStart) +
      pastedText +
      input.substring(event.target.selectionEnd);
    setInput(newValue);
    setScript(newValue);
  };

  async function handleSummarize() {
    //makes http request to server on exposed endpoint
    const response = await fetch("http://localhost:5000/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: script,
      }),
    });
    const aiResponse = await response.json();
    //split the json reponse by colons into an array
    console.log(aiResponse);
    let pointsArray = aiResponse.data.text.split(":::").slice(1);
    if (pointsArray.length % 3 !== 0) {
      const remainder = 3 - (pointsArray.length % 3);
      for (let q = 0; q < remainder; q++) {
        pointsArray.push("");
      }
    }

    setScript("");
    handleCreate(title, pointsArray);
  }

  async function handleCreate(title, summaryPoints) {
    //makes http request to create presentation
    console.log(title, summaryPoints);
    try {
      const response = await fetch(
        "http://localhost:5000/create-presentation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, summaryPoints }),
        }
      );
      const presentation = await response.json();
      setPresId(presentation.data.presentationId);

      return presentation;
    } catch (error) {
      console.error(error);
    }
  }

  const toast = useToast();

  return (
    <Container minW="700" bg="gray.800">
      <Center bg="black" h="100px" color="white">
        <Text fontSize="5xl">Google Slides Automator</Text>
      </Center>
      <br />
      <Center>
        <FileUpload onFileUploaded={handleFileUploaded} />
      </Center>
      <br />
      <Center>
        <Heading>OR</Heading>
      </Center>
      <br />
      <Center>
        <Heading>Paste the script below</Heading>
        <br />
      </Center>
      <form onSubmit={handleSubmit}>
        <strong>Title: </strong>
        <Input
          type="text"
          placeholder="Enter Title"
          onChange={handleChangeTitle}
          value={title}
        ></Input>
        <br />
        <br />
        <strong>Script: </strong>
        <Textarea
          type="text"
          placeholder="Enter Script"
          cols={80}
          rows={10}
          onChange={handleChange}
          onPaste={handlePaste}
          value={input}
        />
        <br />
        <br />
        <Center>
          <Button type="submit" disabled={input === ""}>
            Submit
          </Button>
        </Center>
      </form>
      <Center>
        {presId !== ""
          ? toast({
              title: "Hooray!!!",
              description: (
                <>
                  Presentation has been created!
                  <Link href={url} isExternal>
                    Click here to view
                  </Link>
                </>
              ),
              status: "success",
              duration: 5000,
              isClosable: true,
            }) && setPresId("")
          : null}
      </Center>
    </Container>
  );
}

export default App;
