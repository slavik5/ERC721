import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { parseEther } from "ethers/lib/utils";

task("transfer", "transfer amount on address")
    .addParam("to", "to which account")
    .addParam("amount", "amount to transfer")
    .setAction(async function (taskArgs, hre) {

        const network = hre.network.name;

        console.log(network);

        const [...addr] = await hre.ethers.getSigners();

        const token = await hre.ethers.getContractAt("Token", process.env.token_CONTRACT as string);

        await token.transfer(addr[taskArgs.to].address, taskArgs.amount);

        console.log('transfer task Done!');
    });
task("transferFrom", "transfer amount between addresses")
    .addParam("from", "from which account")
    .addParam("to", "to which account")
    .addParam("amount", "amount to transfer")
    .setAction(async function (taskArgs, hre) {

        const network = hre.network.name;

        console.log(network);

        const [...addr] = await hre.ethers.getSigners();

        const token = await hre.ethers.getContractAt("Token", process.env.token_CONTRACT as string);

        await token.connect(addr[taskArgs.from]).approve(addr[0].address, taskArgs.amount);
        await token.connect(addr[0]).transferFrom(addr[taskArgs.from].address, addr[taskArgs.to].address, taskArgs.amount);

        console.log('transferFrom task Done!');
    });
task("approve", "transfer amount on address")
    .addParam("from", "from which account")
    .addParam("spender", "to which account")
    .addParam("amount", "amount to transfer")
    .setAction(async function (taskArgs, hre) {

        const network = hre.network.name;

        console.log(network);

        const [...addr] = await hre.ethers.getSigners();

        const token = await hre.ethers.getContractAt("Token", process.env.token_CONTRACT as string);

        await token.connect(addr[taskArgs.from]).approve(addr[taskArgs.spender].address, taskArgs.amount);
        const value = await token.allowance(addr[taskArgs.from].address, addr[taskArgs.spender].address);
        console.log(value);
        console.log('approve task Done!');
    });
task("mint", "mint amount")
    .addParam("amount", "amount to transfer")
    .setAction(async function (taskArgs, hre) {

        const network = hre.network.name;

        console.log(network);

        const [...addr] = await hre.ethers.getSigners();

        const token = await hre.ethers.getContractAt("Token", process.env.token_CONTRACT as string);

        await token.mint(addr[1].address, parseEther(taskArgs.amount));

        console.log('mint task Done!');
    });
