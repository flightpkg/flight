#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const ts_morph_1 = require("ts-morph");
const logger_1 = __importStar(require("./logger"));
const js_to_ts_converter_1 = require("./js-to-ts-converter");
const ArgumentParser = require('argparse').ArgumentParser;
const parser = new ArgumentParser({
    version: require('../package.json').version,
    addHelp: true,
    description: 'JS -> TS Converter'
});
parser.addArgument('directory', {
    help: 'The directory of .js files to convert'
});
parser.addArgument('--indentation-text', {
    help: 'How you would like new code to be indented',
    choices: ['tab', 'twospaces', 'fourspaces', 'eightspaces'],
    defaultValue: 'tab'
});
parser.addArgument('--include', {
    help: 'Glob patterns to include in the conversion. Separate multiple patterns ' +
        'with a comma. The patterns must be valid for the "glob-all" npm ' +
        'package (https://www.npmjs.com/package/glob-all), and are relative to ' +
        'the input directory.\n' +
        'Example: --include="**/myFolder/**,**/*.js"'
});
parser.addArgument('--exclude', {
    help: 'Glob patterns to exclude from being converted. Separate multiple patterns ' +
        'with a comma. The patterns must be valid for the "glob-all" npm ' +
        'package (https://www.npmjs.com/package/glob-all), and are relative to ' +
        'the input directory.\n' +
        'Example: --exclude="**/myFolder/**,**/*.jsx"'
});
parser.addArgument('--log-level', {
    help: `
		The level of logs to print to the console. From highest amount of \
		logging to lowest amount of logging: '${logger_1.logLevels.join("', '")}' 
		Defaults to verbose to tell you what's going on, as the script may take
		a long time to complete when looking up usages of functions. Use 'debug'
		to enable even more logging.
	`.trim().replace(/^\t*/gm, ''),
    choices: logger_1.logLevels,
    defaultValue: 'verbose'
});
const args = parser.parseArgs();
const absolutePath = path.resolve(args.directory.replace(/\/$/, '')); // remove any trailing slash
if (!fs.lstatSync(absolutePath).isDirectory()) {
    logger_1.default.error(`${absolutePath} is not a directory. Please provide a directory`);
    process.exit(1);
}
else {
    logger_1.default.info(`Processing directory: '${absolutePath}'`);
}
(0, js_to_ts_converter_1.convertJsToTsSync)(absolutePath, {
    indentationText: resolveIndentationText(args.indentation_text),
    logLevel: resolveLogLevel(args.log_level),
    includePatterns: parseIncludePatterns(args.include),
    excludePatterns: parseExcludePatterns(args.exclude)
});
/**
 * Private helper to resolve the correct IndentationText enum from the CLI
 * 'indentation' argument.
 */
function resolveIndentationText(indentationText) {
    switch (indentationText) {
        case 'tab': return ts_morph_1.IndentationText.Tab;
        case 'twospaces': return ts_morph_1.IndentationText.TwoSpaces;
        case 'fourspaces': return ts_morph_1.IndentationText.FourSpaces;
        case 'eightspaces': return ts_morph_1.IndentationText.EightSpaces;
        default: return ts_morph_1.IndentationText.Tab;
    }
}
function resolveLogLevel(logLevelStr) {
    if (!logger_1.logLevels.includes(logLevelStr)) {
        throw new Error(`
			Unknown --log-level argument '${logLevelStr}'
			Must be one of: '${logger_1.logLevels.join("', '")}'
		`.trim().replace(/\t*/gm, ''));
    }
    return logLevelStr;
}
function parseIncludePatterns(includePatterns) {
    if (!includePatterns) {
        return undefined;
    } // return undefined to use the default
    return includePatterns.split(',');
}
function parseExcludePatterns(excludePatterns) {
    if (!excludePatterns) {
        return [];
    }
    return excludePatterns.split(',');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLDJDQUE2QjtBQUM3Qix1Q0FBeUI7QUFFekIsdUNBQTJDO0FBQzNDLG1EQUF1RDtBQUN2RCw2REFBeUQ7QUFHekQsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLGNBQWMsQ0FBQztBQUMxRCxNQUFNLE1BQU0sR0FBRyxJQUFJLGNBQWMsQ0FBRTtJQUNsQyxPQUFPLEVBQUUsT0FBTyxDQUFFLGlCQUFpQixDQUFFLENBQUMsT0FBTztJQUM3QyxPQUFPLEVBQUUsSUFBSTtJQUNiLFdBQVcsRUFBRSxvQkFBb0I7Q0FDakMsQ0FBRSxDQUFDO0FBQ0osTUFBTSxDQUFDLFdBQVcsQ0FBRSxXQUFXLEVBQUU7SUFDaEMsSUFBSSxFQUFFLHVDQUF1QztDQUM3QyxDQUFFLENBQUM7QUFDSixNQUFNLENBQUMsV0FBVyxDQUFFLG9CQUFvQixFQUFFO0lBQ3pDLElBQUksRUFBRSw0Q0FBNEM7SUFDbEQsT0FBTyxFQUFFLENBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsYUFBYSxDQUFFO0lBQzVELFlBQVksRUFBRSxLQUFLO0NBQ25CLENBQUUsQ0FBQztBQUNKLE1BQU0sQ0FBQyxXQUFXLENBQUUsV0FBVyxFQUFFO0lBQ2hDLElBQUksRUFBRSx5RUFBeUU7UUFDekUsa0VBQWtFO1FBQ2xFLHdFQUF3RTtRQUN4RSx3QkFBd0I7UUFDeEIsNkNBQTZDO0NBQ25ELENBQUUsQ0FBQztBQUNKLE1BQU0sQ0FBQyxXQUFXLENBQUUsV0FBVyxFQUFFO0lBQ2hDLElBQUksRUFBRSw0RUFBNEU7UUFDNUUsa0VBQWtFO1FBQ2xFLHdFQUF3RTtRQUN4RSx3QkFBd0I7UUFDeEIsOENBQThDO0NBQ3BELENBQUUsQ0FBQztBQUNKLE1BQU0sQ0FBQyxXQUFXLENBQUUsYUFBYSxFQUFFO0lBQ2xDLElBQUksRUFBRTs7MENBRW1DLGtCQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7OztFQUk5RCxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBRSxRQUFRLEVBQUUsRUFBRSxDQUFFO0lBQ2hDLE9BQU8sRUFBRSxrQkFBUztJQUNsQixZQUFZLEVBQUUsU0FBUztDQUN2QixDQUFFLENBQUM7QUFFSixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDaEMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBRSxLQUFLLEVBQUUsRUFBRSxDQUFFLENBQUUsQ0FBQyxDQUFFLDRCQUE0QjtBQUd2RyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBRSxZQUFZLENBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRztJQUNqRCxnQkFBTSxDQUFDLEtBQUssQ0FBRSxHQUFHLFlBQVksaURBQWlELENBQUUsQ0FBQztJQUNqRixPQUFPLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBRSxDQUFDO0NBQ2xCO0tBQU07SUFDTixnQkFBTSxDQUFDLElBQUksQ0FBRSwwQkFBMEIsWUFBWSxHQUFHLENBQUUsQ0FBQztDQUN6RDtBQUdELElBQUEsc0NBQWlCLEVBQUUsWUFBWSxFQUFFO0lBQ2hDLGVBQWUsRUFBRSxzQkFBc0IsQ0FBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUU7SUFDaEUsUUFBUSxFQUFFLGVBQWUsQ0FBRSxJQUFJLENBQUMsU0FBUyxDQUFFO0lBQzNDLGVBQWUsRUFBRSxvQkFBb0IsQ0FBRSxJQUFJLENBQUMsT0FBTyxDQUFFO0lBQ3JELGVBQWUsRUFBRSxvQkFBb0IsQ0FBRSxJQUFJLENBQUMsT0FBTyxDQUFFO0NBQ3JELENBQUUsQ0FBQztBQUdKOzs7R0FHRztBQUNILFNBQVMsc0JBQXNCLENBQUUsZUFBbUU7SUFDbkcsUUFBUSxlQUFlLEVBQUc7UUFDekIsS0FBSyxLQUFjLENBQUMsQ0FBQyxPQUFPLDBCQUFlLENBQUMsR0FBRyxDQUFDO1FBQ2hELEtBQUssV0FBYyxDQUFDLENBQUMsT0FBTywwQkFBZSxDQUFDLFNBQVMsQ0FBQztRQUN0RCxLQUFLLFlBQWMsQ0FBQyxDQUFDLE9BQU8sMEJBQWUsQ0FBQyxVQUFVLENBQUM7UUFDdkQsS0FBSyxhQUFjLENBQUMsQ0FBQyxPQUFPLDBCQUFlLENBQUMsV0FBVyxDQUFDO1FBRXhELE9BQVEsQ0FBQyxDQUFDLE9BQU8sMEJBQWUsQ0FBQyxHQUFHLENBQUM7S0FDckM7QUFDRixDQUFDO0FBR0QsU0FBUyxlQUFlLENBQUUsV0FBbUI7SUFDNUMsSUFBSSxDQUFDLGtCQUFTLENBQUMsUUFBUSxDQUFFLFdBQVcsQ0FBRSxFQUFHO1FBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUU7bUNBQ2dCLFdBQVc7c0JBQ3hCLGtCQUFTLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRTtHQUMzQyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBRSxPQUFPLEVBQUUsRUFBRSxDQUFFLENBQUUsQ0FBQztLQUNsQztJQUVELE9BQU8sV0FBdUIsQ0FBQztBQUNoQyxDQUFDO0FBR0QsU0FBUyxvQkFBb0IsQ0FBRSxlQUFtQztJQUNqRSxJQUFJLENBQUMsZUFBZSxFQUFHO1FBQUUsT0FBTyxTQUFTLENBQUM7S0FBRSxDQUFFLHNDQUFzQztJQUVwRixPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUUsR0FBRyxDQUFFLENBQUM7QUFDckMsQ0FBQztBQUVELFNBQVMsb0JBQW9CLENBQUUsZUFBbUM7SUFDakUsSUFBSSxDQUFDLGVBQWUsRUFBRztRQUFFLE9BQU8sRUFBRSxDQUFDO0tBQUU7SUFFckMsT0FBTyxlQUFlLENBQUMsS0FBSyxDQUFFLEdBQUcsQ0FBRSxDQUFDO0FBQ3JDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcblxuaW1wb3J0IHsgSW5kZW50YXRpb25UZXh0IH0gZnJvbSBcInRzLW1vcnBoXCI7XG5pbXBvcnQgbG9nZ2VyLCB7IExvZ0xldmVsLCBsb2dMZXZlbHMgfSBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQgeyBjb252ZXJ0SnNUb1RzU3luYyB9IGZyb20gXCIuL2pzLXRvLXRzLWNvbnZlcnRlclwiO1xuXG5cbmNvbnN0IEFyZ3VtZW50UGFyc2VyID0gcmVxdWlyZSgnYXJncGFyc2UnKS5Bcmd1bWVudFBhcnNlcjtcbmNvbnN0IHBhcnNlciA9IG5ldyBBcmd1bWVudFBhcnNlcigge1xuXHR2ZXJzaW9uOiByZXF1aXJlKCAnLi4vcGFja2FnZS5qc29uJyApLnZlcnNpb24sXG5cdGFkZEhlbHA6IHRydWUsXG5cdGRlc2NyaXB0aW9uOiAnSlMgLT4gVFMgQ29udmVydGVyJ1xufSApO1xucGFyc2VyLmFkZEFyZ3VtZW50KCAnZGlyZWN0b3J5Jywge1xuXHRoZWxwOiAnVGhlIGRpcmVjdG9yeSBvZiAuanMgZmlsZXMgdG8gY29udmVydCdcbn0gKTtcbnBhcnNlci5hZGRBcmd1bWVudCggJy0taW5kZW50YXRpb24tdGV4dCcsIHtcblx0aGVscDogJ0hvdyB5b3Ugd291bGQgbGlrZSBuZXcgY29kZSB0byBiZSBpbmRlbnRlZCcsXG5cdGNob2ljZXM6IFsgJ3RhYicsICd0d29zcGFjZXMnLCAnZm91cnNwYWNlcycsICdlaWdodHNwYWNlcycgXSxcblx0ZGVmYXVsdFZhbHVlOiAndGFiJ1xufSApO1xucGFyc2VyLmFkZEFyZ3VtZW50KCAnLS1pbmNsdWRlJywge1xuXHRoZWxwOiAnR2xvYiBwYXR0ZXJucyB0byBpbmNsdWRlIGluIHRoZSBjb252ZXJzaW9uLiBTZXBhcmF0ZSBtdWx0aXBsZSBwYXR0ZXJucyAnICtcblx0ICAgICAgJ3dpdGggYSBjb21tYS4gVGhlIHBhdHRlcm5zIG11c3QgYmUgdmFsaWQgZm9yIHRoZSBcImdsb2ItYWxsXCIgbnBtICcgK1xuXHQgICAgICAncGFja2FnZSAoaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvZ2xvYi1hbGwpLCBhbmQgYXJlIHJlbGF0aXZlIHRvICcgK1xuXHQgICAgICAndGhlIGlucHV0IGRpcmVjdG9yeS5cXG4nICtcblx0ICAgICAgJ0V4YW1wbGU6IC0taW5jbHVkZT1cIioqL215Rm9sZGVyLyoqLCoqLyouanNcIidcbn0gKTtcbnBhcnNlci5hZGRBcmd1bWVudCggJy0tZXhjbHVkZScsIHtcblx0aGVscDogJ0dsb2IgcGF0dGVybnMgdG8gZXhjbHVkZSBmcm9tIGJlaW5nIGNvbnZlcnRlZC4gU2VwYXJhdGUgbXVsdGlwbGUgcGF0dGVybnMgJyArXG5cdCAgICAgICd3aXRoIGEgY29tbWEuIFRoZSBwYXR0ZXJucyBtdXN0IGJlIHZhbGlkIGZvciB0aGUgXCJnbG9iLWFsbFwiIG5wbSAnICtcblx0ICAgICAgJ3BhY2thZ2UgKGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2dsb2ItYWxsKSwgYW5kIGFyZSByZWxhdGl2ZSB0byAnICtcblx0ICAgICAgJ3RoZSBpbnB1dCBkaXJlY3RvcnkuXFxuJyArXG5cdCAgICAgICdFeGFtcGxlOiAtLWV4Y2x1ZGU9XCIqKi9teUZvbGRlci8qKiwqKi8qLmpzeFwiJ1xufSApO1xucGFyc2VyLmFkZEFyZ3VtZW50KCAnLS1sb2ctbGV2ZWwnLCB7XG5cdGhlbHA6IGBcblx0XHRUaGUgbGV2ZWwgb2YgbG9ncyB0byBwcmludCB0byB0aGUgY29uc29sZS4gRnJvbSBoaWdoZXN0IGFtb3VudCBvZiBcXFxuXHRcdGxvZ2dpbmcgdG8gbG93ZXN0IGFtb3VudCBvZiBsb2dnaW5nOiAnJHtsb2dMZXZlbHMuam9pbihcIicsICdcIil9JyBcblx0XHREZWZhdWx0cyB0byB2ZXJib3NlIHRvIHRlbGwgeW91IHdoYXQncyBnb2luZyBvbiwgYXMgdGhlIHNjcmlwdCBtYXkgdGFrZVxuXHRcdGEgbG9uZyB0aW1lIHRvIGNvbXBsZXRlIHdoZW4gbG9va2luZyB1cCB1c2FnZXMgb2YgZnVuY3Rpb25zLiBVc2UgJ2RlYnVnJ1xuXHRcdHRvIGVuYWJsZSBldmVuIG1vcmUgbG9nZ2luZy5cblx0YC50cmltKCkucmVwbGFjZSggL15cXHQqL2dtLCAnJyApLFxuXHRjaG9pY2VzOiBsb2dMZXZlbHMsXG5cdGRlZmF1bHRWYWx1ZTogJ3ZlcmJvc2UnXG59ICk7XG5cbmNvbnN0IGFyZ3MgPSBwYXJzZXIucGFyc2VBcmdzKCk7XG5jb25zdCBhYnNvbHV0ZVBhdGggPSBwYXRoLnJlc29sdmUoIGFyZ3MuZGlyZWN0b3J5LnJlcGxhY2UoIC9cXC8kLywgJycgKSApOyAgLy8gcmVtb3ZlIGFueSB0cmFpbGluZyBzbGFzaFxuXG5cbmlmKCAhZnMubHN0YXRTeW5jKCBhYnNvbHV0ZVBhdGggKS5pc0RpcmVjdG9yeSgpICkge1xuXHRsb2dnZXIuZXJyb3IoIGAke2Fic29sdXRlUGF0aH0gaXMgbm90IGEgZGlyZWN0b3J5LiBQbGVhc2UgcHJvdmlkZSBhIGRpcmVjdG9yeWAgKTtcblx0cHJvY2Vzcy5leGl0KCAxICk7XG59IGVsc2Uge1xuXHRsb2dnZXIuaW5mbyggYFByb2Nlc3NpbmcgZGlyZWN0b3J5OiAnJHthYnNvbHV0ZVBhdGh9J2AgKTtcbn1cblxuXG5jb252ZXJ0SnNUb1RzU3luYyggYWJzb2x1dGVQYXRoLCB7XG5cdGluZGVudGF0aW9uVGV4dDogcmVzb2x2ZUluZGVudGF0aW9uVGV4dCggYXJncy5pbmRlbnRhdGlvbl90ZXh0ICksXG5cdGxvZ0xldmVsOiByZXNvbHZlTG9nTGV2ZWwoIGFyZ3MubG9nX2xldmVsICksXG5cdGluY2x1ZGVQYXR0ZXJuczogcGFyc2VJbmNsdWRlUGF0dGVybnMoIGFyZ3MuaW5jbHVkZSApLFxuXHRleGNsdWRlUGF0dGVybnM6IHBhcnNlRXhjbHVkZVBhdHRlcm5zKCBhcmdzLmV4Y2x1ZGUgKVxufSApO1xuXG5cbi8qKlxuICogUHJpdmF0ZSBoZWxwZXIgdG8gcmVzb2x2ZSB0aGUgY29ycmVjdCBJbmRlbnRhdGlvblRleHQgZW51bSBmcm9tIHRoZSBDTElcbiAqICdpbmRlbnRhdGlvbicgYXJndW1lbnQuXG4gKi9cbmZ1bmN0aW9uIHJlc29sdmVJbmRlbnRhdGlvblRleHQoIGluZGVudGF0aW9uVGV4dDogJ3RhYicgfCAndHdvc3BhY2VzJyB8ICdmb3Vyc3BhY2VzJyB8ICdlaWdodHNwYWNlcycgKSB7XG5cdHN3aXRjaCggaW5kZW50YXRpb25UZXh0ICkge1xuXHRcdGNhc2UgJ3RhYicgICAgICAgICA6IHJldHVybiBJbmRlbnRhdGlvblRleHQuVGFiO1xuXHRcdGNhc2UgJ3R3b3NwYWNlcycgICA6IHJldHVybiBJbmRlbnRhdGlvblRleHQuVHdvU3BhY2VzO1xuXHRcdGNhc2UgJ2ZvdXJzcGFjZXMnICA6IHJldHVybiBJbmRlbnRhdGlvblRleHQuRm91clNwYWNlcztcblx0XHRjYXNlICdlaWdodHNwYWNlcycgOiByZXR1cm4gSW5kZW50YXRpb25UZXh0LkVpZ2h0U3BhY2VzO1xuXG5cdFx0ZGVmYXVsdCA6IHJldHVybiBJbmRlbnRhdGlvblRleHQuVGFiO1xuXHR9XG59XG5cblxuZnVuY3Rpb24gcmVzb2x2ZUxvZ0xldmVsKCBsb2dMZXZlbFN0cjogc3RyaW5nICk6IExvZ0xldmVsIHtcblx0aWYoICFsb2dMZXZlbHMuaW5jbHVkZXMoIGxvZ0xldmVsU3RyICkgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgXG5cdFx0XHRVbmtub3duIC0tbG9nLWxldmVsIGFyZ3VtZW50ICcke2xvZ0xldmVsU3RyfSdcblx0XHRcdE11c3QgYmUgb25lIG9mOiAnJHtsb2dMZXZlbHMuam9pbiggXCInLCAnXCIgKX0nXG5cdFx0YC50cmltKCkucmVwbGFjZSggL1xcdCovZ20sICcnICkgKTtcblx0fVxuXG5cdHJldHVybiBsb2dMZXZlbFN0ciBhcyBMb2dMZXZlbDtcbn1cblxuXG5mdW5jdGlvbiBwYXJzZUluY2x1ZGVQYXR0ZXJucyggaW5jbHVkZVBhdHRlcm5zOiBzdHJpbmcgfCB1bmRlZmluZWQgKTogc3RyaW5nW10gfCB1bmRlZmluZWQge1xuXHRpZiggIWluY2x1ZGVQYXR0ZXJucyApIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSAgLy8gcmV0dXJuIHVuZGVmaW5lZCB0byB1c2UgdGhlIGRlZmF1bHRcblxuXHRyZXR1cm4gaW5jbHVkZVBhdHRlcm5zLnNwbGl0KCAnLCcgKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VFeGNsdWRlUGF0dGVybnMoIGV4Y2x1ZGVQYXR0ZXJuczogc3RyaW5nIHwgdW5kZWZpbmVkICk6IHN0cmluZ1tdIHtcblx0aWYoICFleGNsdWRlUGF0dGVybnMgKSB7IHJldHVybiBbXTsgfVxuXG5cdHJldHVybiBleGNsdWRlUGF0dGVybnMuc3BsaXQoICcsJyApO1xufSJdfQ==