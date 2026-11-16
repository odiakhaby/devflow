#!/usr/bin/env node
// PreToolUse(Read|Edit|Write|MultiEdit) :
// - aucun accès aux fichiers .env (secrets) ; .env.example & co restent autorisés ;
// - aucune modification d'une migration déjà versionnée dans git.
import { basename, isAbsolute, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { block, readInput } from './lib.mjs';

const input = readInput();
const tool = String(input.tool_name ?? '');
const filePath = input?.tool_input?.file_path;
if (!filePath) process.exit(0);
const cwd = input.cwd || process.cwd();
const abs = isAbsolute(filePath) ? filePath : resolve(cwd, filePath);
const name = basename(abs);

const isEnvFile = /^\.env(\..+)?$/.test(name) && !/\.(example|sample|template|dist|schema)$/.test(name);
if (isEnvFile) {
  block(`${tool} sur ${name} bloqué : les fichiers .env contiennent des secrets. Documente les variables dans .env.example.`);
}

const writes = tool === 'Edit' || tool === 'Write' || tool === 'MultiEdit';
if (writes && /(^|[\\/])migrations[\\/]/.test(abs)) {
  const tracked = spawnSync('git', ['ls-files', '--error-unmatch', abs], { cwd, encoding: 'utf8' }).status === 0;
  if (tracked) {
    block('Cette migration est déjà versionnée : ne la modifie pas. Crée une nouvelle migration (ex. `prisma migrate dev --name <nom>`).');
  }
}

process.exit(0);
