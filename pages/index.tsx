import Layout from "../components/Layout";
import {
  Box,
  FormControl,
  FormLabel,
  Textarea,
  Button,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { injected } from "../lib/web3/connectors";
import TODOABI from "../lib/abi/todo.json";
import { ethers } from "ethers";
import { useEagerConnect, useInactiveListener } from "../hooks/hooks";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

const IndexPage: React.FC = () => {
  const { activate, account, library, connector } =
    useWeb3React<Web3Provider>();
  const [task, setTask] = useState("");
  const [taskList, setTaskList] = useState([""]);

  const [activatingConnector, setActivatingConnector] = useState<any>();
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }

    activate(injected).then(async () => {
      activate(injected).catch((e) => {
        console.error(e);
      });

      if (library) {
        const contract = new ethers.Contract(
          contractAddress,
          TODOABI,
          library.getSigner()
        );
        const taskList = await contract.functions.getTodoListByOwner(account);

        const hexList = taskList[0].map((num) => {
          return num._hex;
        });

        const todoList = await Promise.all(
          hexList.map(async (num: number) => {
            return await contract.functions.todoList(num);
          })
        );

        const result = todoList.map((todo) => {
          return todo.task;
        });

        setTaskList(result);
      } else return;
    });
  }, [activatingConnector, connector]);

  const triedEager = useEagerConnect();

  useInactiveListener(!triedEager || !!activatingConnector);

  const submitHandler = async () => {
    await activate(injected).catch((e) => {
      console.error(e);
    });

    if (!injected.supportedChainIds) return;

    activate(injected).then(async () => {
      if (library) {
        const contract = new ethers.Contract(
          contractAddress,
          TODOABI,
          library.getSigner()
        );
        await contract.functions.createTodo(task);
      } else return;
    });
  };

  return (
    <Layout>
      <Box
        display="flex"
        width="600px"
        margin="auto"
        justifyContent="center"
        alignContent="center"
        flexDirection="column"
      >
        <FormLabel margin="auto">Todo app</FormLabel>
        <Box border="2px black" margin="40px auto">
          {taskList?.map((item) => (
            <Box
              key={item}
              width="380px"
              height="50px"
              overflow="hidden"
              borderRadius="8px"
              boxShadow="0 4px 15px rgba(0,0,0,.2)"
              padding="10px"
              mt="10px"
            >
              {item}
            </Box>
          ))}
        </Box>
        <FormControl>
          <Textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
          ></Textarea>
        </FormControl>
        <Button type="submit" onClick={submitHandler}>
          Button
        </Button>
      </Box>
    </Layout>
  );
};

export default IndexPage;
