# Projeto Integrador — Sistema de Controle de Estoque

Gran Faculdade — projeto Fullstack. Node.js, Express, SQLite e React (Vite). 

## Executar no Windows
Instale Node.js 22 LTS e VS Code. Extraia o ZIP e abra a pasta estoque no VS Code. Abra dois terminais:

Terminal 1:
```sh
cd backend
npm install
npm start
```
Terminal 2 (a partir da pasta estoque):
```sh
cd frontend
npm install
npm run dev
```
Abra http://localhost:5173. A API usa a porta 3001. O banco estoque.db é criado automaticamente no backend.

## Testes manuais
1. Cadastre um fornecedor com CNPJ válido (exemplo de teste: 11.222.333/0001-81), telefone, endereço, e-mail e contato fictícios. Repita o CNPJ: deve retornar 409.
2. Cadastre um produto com nome, descrição, categoria e código 123456. Repita o código: deve retornar 409.
3. Envie campos obrigatórios vazios: deve retornar 400 e mostrar erros.
4. Abra Fornecedores na linha do produto, selecione um fornecedor e associe. Repita a associação: deve retornar 409. Desassocie e confira a lista.
5. Edite e exclua registros. Reinicie o backend e confira a persistência.

## API (Insomnia)
Base http://localhost:3001/api. GET e POST /produtos e /fornecedores; GET, PUT e DELETE /produtos/:id e /fornecedores/:id. GET e POST /produtos/:id/fornecedores (POST JSON {"fornecedor":1}); DELETE /produtos/:id/fornecedores/:fid.

## GitHub
Na raiz, execute git init, git add ., git commit -m "Projeto integrador estoque". Crie um repositório no GitHub e siga as instruções de push fornecidas pelo GitHub.

Projeto acadêmico local, sem autenticação; não publicar com dados reais sem adicionar segurança. Dependências precisam ser instaladas antes dos testes.
