import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import * as fs from "fs";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import packageJson from "./package.json" assert { type: "json" };

const plugins = [
	peerDepsExternal(),
	resolve(),
	commonjs(),
	typescript({
		tsconfig: "./tsconfig.json",
		useTsconfigDeclarationDir: true,
	}),
	terser(),
];

const getFolders = (entry) => {
	// get the names of folders and files of the entry directory
	const dirs = fs.readdirSync(entry);
	// do not include folders not meant for export and do not process index.ts
	const dirsWithoutIndex = dirs
		.filter((name) => name !== "index.ts")
		.filter((name) => name !== "utils");
	// ['Accordion', 'Button'...]
	return dirsWithoutIndex;
};

//loop through your folders and generate a rollup obj per folder
const folderBuilds = getFolders("./src").map((folder) => {
	return {
		input: `src/${folder}/index.ts`,
		output: {
			// ensure file destination is same as where the typings are
			file: `dist/${folder}/index.js`,
			sourcemap: true,
			exports: "named",
		},
		plugins,
		external: ["react", "react-dom"],
	};
});

export default [
	{
		input: ["src/index.ts"],
		output: [
			{
				file: packageJson.module,
				format: "esm",
				sourcemap: true,
				exports: "named",
			},
		],
		plugins,
		external: ["react", "react-dom"],
	},
	...folderBuilds,
	{
		input: ["src/index.ts"],
		output: [
			{
				file: packageJson.main,
				format: "cjs",
				sourcemap: true,
				exports: "named",
			},
		],
		plugins,
		external: ["react", "react-dom"],
	},
];
