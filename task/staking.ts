import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { parseEther } from "ethers/lib/utils";

task("stake", "stake amount ")
    .addParam("account", "who stake")
    .addParam("amount", "amount to stake")
    .setAction(async function (taskArgs, hre) {

        const network = hre.network.name;

        console.log(network);

        const [...addr] = await hre.ethers.getSigners();

        const staking = await hre.ethers.getContractAt("Staking", process.env.staking_CONTRACT as string);
        const token = await hre.ethers.getContractAt("Token", process.env.token_CONTRACT as string);

        token.grantRole(await token.DEFAULT_ADMIN_ROLE(), staking.address);

        await token.connect(addr[taskArgs.account]).approve(staking.address,taskArgs.amount);
        await staking.connect(addr[taskArgs.account]).stake(taskArgs.amount);

        console.log('stake task Done!');
    });
    
task("unstake", "stake amount ")
    .addParam("account", "who unstake")
    .setAction(async function (taskArgs, hre) {

        const network = hre.network.name;

        console.log(network);

        const [...addr] = await hre.ethers.getSigners();

        const staking = await hre.ethers.getContractAt("Staking", process.env.staking_CONTRACT as string);

        await staking.connect(addr[taskArgs.account]).unstake();

        console.log('unstake task Done!');
    });

task("claim", "stake amount ")
    .addParam("account", "who claim")
    .setAction(async function (taskArgs, hre) {

        const network = hre.network.name;

        console.log(network);

        const [...addr] = await hre.ethers.getSigners();

        const staking = await hre.ethers.getContractAt("Staking", process.env.staking_CONTRACT as string);

        await staking.connect(addr[taskArgs.account]).claim();

        console.log('unstake task Done!');
    });