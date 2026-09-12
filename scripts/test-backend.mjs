import ts from 'typescript';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
// Compile only the backend's pure modules for Node tests; production uses Vinext.
const root='.sites-runtime/backend-test';mkdirSync(root,{recursive:true});
for(const name of ['access','errors','queries','handlers']){
  let code=ts.transpileModule(readFileSync('lib/leadrescue/backend/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  code=code.replace(/from '(\.\/[^']+)'/g,"from '$1.mjs'");writeFileSync(root+'/'+name+'.mjs',code);
}
const r=spawnSync(process.execPath,['--test','tests/backend.test.mjs','tests/database.test.mjs'],{stdio:'inherit'});process.exit(r.status??1);
