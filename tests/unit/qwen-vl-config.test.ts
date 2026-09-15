import { describe, it, expect } from 'bun:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'yaml';

describe('Qwen2.5-VL-72B-Instruct Configuration Example', () => {
    const configPath = path.resolve('examples/qwen2.5-vl-72b-instruct.yaml');

    it('config file exists and has valid YAML structure with required options', () => {
        expect(fs.existsSync(configPath)).toBe(true);
        const raw = fs.readFileSync(configPath, 'utf8');
        const parsed = yaml.parse(raw);

        expect(parsed.model).toBe('Qwen/Qwen2.5-VL-72B-Instruct');
        expect(parsed['tensor-parallel-size']).toBe(4);
        expect(parsed['max-model-len']).toBe(128000);
        expect(parsed['dtype']).toBe('bfloat16');
        expect(parsed['gpu-memory-utilization']).toBe(0.9);
        expect(parsed['mm-encoder-tp-mode']).toBe('data');
        expect(parsed['enable-auto-tool-choice']).toBe(true);
        expect(parsed['tool-call-parser']).toBe('hermes');
        expect(parsed['enable-prefix-caching']).toBe(true);
        expect(parsed['min-vllm-version']).toBe('0.19.1');
    });
});
