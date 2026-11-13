const express=require('express'), cors=require('cors'), Database=require('better-sqlite3');
const app=express(), db=new Database('estoque.db'); app.use(cors()); app.use(express.json({limit:'10mb'})); db.pragma('foreign_keys = ON');
db.exec(`CREATE TABLE IF NOT EXISTS fornecedores(id INTEGER PRIMARY KEY,nome TEXT NOT NULL,cnpj TEXT UNIQUE NOT NULL,endereco TEXT NOT NULL,telefone TEXT NOT NULL,email TEXT NOT NULL,contato TEXT NOT NULL); CREATE TABLE IF NOT EXISTS produtos(id INTEGER PRIMARY KEY,nome TEXT NOT NULL,codigo TEXT UNIQUE,descricao TEXT NOT NULL,quantidade INTEGER DEFAULT 0,categoria TEXT NOT NULL,validade TEXT,imagem TEXT); CREATE TABLE IF NOT EXISTS associacoes(produto INTEGER REFERENCES produtos(id) ON DELETE CASCADE,fornecedor INTEGER REFERENCES fornecedores(id) ON DELETE CASCADE,PRIMARY KEY(produto,fornecedor));`);
const configs={fornecedores:{fields:['nome','cnpj','endereco','telefone','email','contato'],required:['nome','cnpj','endereco','telefone','email','contato'],singular:'Fornecedor'},produtos:{fields:['nome','codigo','descricao','quantidade','categoria','validade','imagem'],required:['nome','descricao','categoria'],singular:'Produto'}};
function validate(t,b){const c=configs[t],e={}; for(const f of c.required)if(!String(b[f]??'').trim())e[f]='Campo obrigatório'; if(t==='fornecedores'){b.cnpj=String(b.cnpj??'').replace(/\D/g,''); if(!/^\d{14}$/.test(b.cnpj)||/^(\d)\1+$/.test(b.cnpj))e.cnpj='CNPJ inválido'; else {const digit=(s,w)=>{let r=s.split('').reduce((a,n,i)=>a+Number(n)*w[i],0)%11;return r<2?0:11-r}; if(digit(b.cnpj.slice(0,12),[5,4,3,2,9,8,7,6,5,4,3,2])!==Number(b.cnpj[12])||digit(b.cnpj.slice(0,13),[6,5,4,3,2,9,8,7,6,5,4,3,2])!==Number(b.cnpj[13]))e.cnpj='CNPJ inválido';} if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email??''))e.email='E-mail inválido'; if(!/^\d{10,11}$/.test(String(b.telefone??'').replace(/\D/g,'')))e.telefone='Telefone inválido';}else{b.codigo=String(b.codigo??'').trim()||null;if(b.codigo&&!/^\d+$/.test(b.codigo))e.codigo='Use apenas números';b.quantidade=Number(b.quantidade||0);if(!Number.isInteger(b.quantidade)||b.quantidade<0)e.quantidade='Quantidade inválida';}return e;}
for(const [t,c] of Object.entries(configs)){app.get('/api/'+t,(q,r)=>r.json(db.prepare(`SELECT * FROM ${t} ORDER BY id DESC`).all()));app.get('/api/'+t+'/:id',(q,r)=>{const row=db.prepare(`SELECT * FROM ${t} WHERE id=?`).get(q.params.id);row?r.json(row):r.status(404).json({message:'Não encontrado'});}); const save=(q,r)=>{const b=q.body,e=validate(t,b);if(Object.keys(e).length)return r.status(400).json({errors:e,message:'Revise os campos'});const vals=c.fields.map(f=>b[f]??null);try{if(q.params.id){const result=db.prepare(`UPDATE ${t} SET ${c.fields.map(f=>f+'=?').join(',')} WHERE id=?`).run(...vals,q.params.id);if(!result.changes)return r.status(404).json({message:'Não encontrado'});}else db.prepare(`INSERT INTO ${t} (${c.fields.join(',')}) VALUES (${vals.map(()=>'?').join(',')})`).run(...vals);r.status(q.params.id?200:201).json({message:c.singular+(q.params.id?' atualizado':' cadastrado')+' com sucesso!'});}catch(e){if(e.code==='SQLITE_CONSTRAINT_UNIQUE')return r.status(409).json({message:t==='fornecedores'?'Fornecedor com esse CNPJ já está cadastrado!':'Produto com este código de barras já está cadastrado!'});throw e;}};app.post('/api/'+t,save);app.put('/api/'+t+'/:id',save);app.delete('/api/'+t+'/:id',(q,r)=>{db.prepare(`DELETE FROM ${t} WHERE id=?`).run(q.params.id);r.json({message:'Registro removido!'});});}
app.get('/api/produtos/:id/fornecedores',(q,r)=>r.json(db.prepare('SELECT f.* FROM fornecedores f JOIN associacoes a ON a.fornecedor=f.id WHERE a.produto=?').all(q.params.id)));app.post('/api/produtos/:id/fornecedores',(q,r)=>{try{db.prepare('INSERT INTO associacoes VALUES (?,?)').run(q.params.id,q.body.fornecedor);r.status(201).json({message:'Fornecedor associado com sucesso ao produto!'});}catch(e){r.status(409).json({message:e.code==='SQLITE_CONSTRAINT_PRIMARYKEY'?'Fornecedor já está associado a este produto!':'Produto ou fornecedor inválido'});}});app.delete('/api/produtos/:id/fornecedores/:fid',(q,r)=>{db.prepare('DELETE FROM associacoes WHERE produto=? AND fornecedor=?').run(q.params.id,q.params.fid);r.json({message:'Fornecedor desassociado com sucesso!'});});app.use((e,q,r,n)=>r.status(500).json({message:'Erro interno'}));app.listen(3001,()=>console.log('API: http://localhost:3001'));
 // Endpoint 1 - Produtos com estoque baixo
app.get('/api/estoque-baixo', (req, res) => {
    const produtos = db.prepare(`
        SELECT * FROM produtos
        WHERE estoque <= 5
        ORDER BY estoque ASC
    `).all();

    res.json(produtos);
});

// Endpoint 2 - Relatorio geral de estoque
app.get('/api/relatorio-estoque', (req, res) => {
    const relatorio = db.prepare(`
        SELECT
            COUNT(*) AS total_produtos,
            COALESCE(SUM(estoque), 0) AS total_unidades,
            COUNT(CASE WHEN estoque <= 5 THEN 1 END)
                AS produtos_estoque_baixo
        FROM produtos
    `).get();

    res.json(relatorio);
});
