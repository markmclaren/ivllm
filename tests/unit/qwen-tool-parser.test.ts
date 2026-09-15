import { describe, it, expect } from 'bun:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'yaml';

describe('Qwen 2.5 Coder Custom Tool Parser Plugin', () => {
    const pluginPath = path.resolve('src/engine/plugins/qwen2_5_coder_tool_parser.py');
    const templatePath = path.resolve('src/engine/plugins/tool_chat_template_qwen2_5_coder.jinja');
    const configPath = path.resolve('examples/qwen2.5-coder-32b-instruct.yaml');

    it('plugin file exists and registers qwen_2_5 and qwen2_5_coder', () => {
        expect(fs.existsSync(pluginPath)).toBe(true);
        const content = fs.readFileSync(pluginPath, 'utf8');
        expect(content).toContain('qwen_2_5');
        expect(content).toContain('qwen2_5_coder');
        expect(content).toContain('@ToolParserManager.register_module');
        expect(content).toContain('class Qwen25CoderToolParser');
    });

    it('Jinja chat template exists and contains <tools> examples', () => {
        expect(fs.existsSync(templatePath)).toBe(true);
        const content = fs.readFileSync(templatePath, 'utf8');
        expect(content).toContain('<tools>');
        expect(content).toContain('</tools>');
        expect(content).toContain('Available tools:');
    });

    it('qwen2.5-coder-32b-instruct.yaml configures tool parser plugin, parser name, and template', () => {
        expect(fs.existsSync(configPath)).toBe(true);
        const raw = fs.readFileSync(configPath, 'utf8');
        const parsed = yaml.parse(raw);

        expect(parsed['enable-auto-tool-choice']).toBe(true);
        expect(parsed['tool-parser-plugin']).toBe('plugins/qwen2_5_coder_tool_parser.py');
        expect(parsed['tool-call-parser']).toBe('qwen_2_5');
        expect(parsed['chat-template']).toBe('plugins/tool_chat_template_qwen2_5_coder.jinja');
    });

    it('correctly extracts tool calls matching <tools>...</tools> regex pattern', () => {
        // Test regex matching logic used in the parser
        const toolCallRegex = /<tools>\s*([\s\S]*?)\s*<\/tools>|<tools>\s*([\s\S]*)/g;

        const singleOutput = 'Here is the tool call:\n<tools>\n{"name": "read_file", "arguments": {"path": "test.txt"}}\n</tools>\nDone.';
        const matches = Array.from(singleOutput.matchAll(toolCallRegex));
        expect(matches.length).toBe(1);

        const jsonStr = (matches[0][1] || matches[0][2] || '').trim();
        const parsed = JSON.parse(jsonStr);
        expect(parsed.name).toBe('read_file');
        expect(parsed.arguments.path).toBe('test.txt');

        // Parallel tool calls (repeated tags)
        const parallelOutput = '<tools>{"name": "fn1", "arguments": {}}</tools><tools>{"name": "fn2", "arguments": {}}</tools>';
        const parallelMatches = Array.from(parallelOutput.matchAll(toolCallRegex));
        expect(parallelMatches.length).toBe(2);

        // Array format
        const arrayOutput = '<tools>[{"name": "fn1"}, {"name": "fn2"}]</tools>';
        const arrayMatches = Array.from(arrayOutput.matchAll(toolCallRegex));
        expect(arrayMatches.length).toBe(1);
        const arrayParsed = JSON.parse(arrayMatches[0][1]);
        expect(Array.isArray(arrayParsed)).toBe(true);
        expect(arrayParsed.length).toBe(2);
    });
});
