import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { commands } from "./cmds";

const builder = yargs(hideBin(process.argv));
builder.scriptName("casa");

commands.forEach(o => builder.command(o));

builder
.help()
.argv;