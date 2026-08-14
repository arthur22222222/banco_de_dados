const express = require("express")
const app = express()
const port = 3000 
app.use(express.json())

const db = require("./db")

const bcrypt = require("/bcrypt")

app.post("/cliente", async (req, res) =>{
    try{
        const cliente = req.body
        const senhaCript = bcrypt.hashSync(cliente.senha, 10)
        cliente.senha = senhaCript

        const resultado = await db.pool.query(
            `INSERT into Clientes (
                senha, cpf, nome, email, celular
             ) VALUES (
                ?,?, ?, ?, ?
             )`,
             [cliente.senha, cliente.cpf, cliente.nome, cliente.email, cliente.celular]
        
        )
        res.status(201).json({
            mensagem: "Cliente cadastrado com sucesso, ID = " + resultado[0].insertId
        })
    } catch(error){
        res.status(500).json({erro: error.message})
    }
})

app.listen(port, () => {
    console.log("API rodando na porta" + port)
})