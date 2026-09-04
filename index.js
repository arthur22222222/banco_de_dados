const express = require("express")
const bcrypt = require("bcrypt")
const db = require("./db")

const app = express()
const porta = 3000

app.use(express.json())

const camposPermitidos = {
    senha: "senha",
    cpf: "cpf",
    nome: "nome",
    email: "email",
    celular: "cll"
}

const consultaClientes = `
    SELECT id, cpf, nome, email, cll AS celular
    FROM clientes
`

app.post("/clientes", async (req, res) => {
    try {
        const body = req.body || {}
        const camposObrigatorios = ["senha", "cpf", "nome", "email", "celular"]
        const camposFaltantes = camposObrigatorios.filter(
            (campo) => body[campo] === undefined
        )

        if (camposFaltantes.length > 0) {
            return res.status(400).json({
                erro: `Campos obrigatórios faltando: ${camposFaltantes.join(", ")}`
            })
        }

        const senhaHash = bcrypt.hashSync(body.senha, 10)
        const [resultado] = await db.pool.query(
            `
                INSERT INTO clientes (senha, cpf, nome, email, cll)
                VALUES (?, ?, ?, ?, ?)
            `,
            [
                senhaHash,
                body.cpf,
                body.nome,
                body.email,
                body.celular
            ]
        )

        return res.status(201).json({
            mensagem: "Cliente cadastrado com sucesso",
            id: resultado.insertId
        })
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ erro: "CPF ou e-mail já cadastrado" })
        }

        return res.status(500).json({ erro: error.message })
    }
})

app.post("/login", (req,res) => {
    try{
        const user = req.body
        const resultado = await db.pool.query(
            "SELECT email, senha FROM cliente WHERE email = ?", [user.email]
        )
        const dados_bd = resultado[0][0]
        if(!dados_bd) {
            return res.status(401).json({msg: "Email não cadastrado!"})
        }
        if(user.senha != dados_bd.senha) {
            return res.status(200).json({msg: "Credencia inválidas!"})
        }
        return res.status(200).json({msg:"login realizado com sucesso!"})

    } catch (error) {
        res.status(500).json({erro: error.message})
    }
})

app.get("/clientes", async (req, res) => {
    try {
        const [clientes] = await db.pool.query(consultaClientes)
        return res.status(200).json(clientes)
    } catch (error) {
        return res.status(500).json({ erro: error.message })
    }
})

app.get("/clientes/:id", async (req, res) => {
    try {
        const [clientes] = await db.pool.query(
            `${consultaClientes} WHERE id = ?`,
            [req.params.id]
        )

        if (clientes.length === 0) {
            return res.status(404).json({ erro: "Cliente não encontrado" })
        }

        return res.status(200).json(clientes[0])
    } catch (error) {
        return res.status(500).json({ erro: error.message })
    }
})

app.put("/clientes/:id", async (req, res) => {
    try {
        const body = req.body || {}
        const colunas = []
        const valores = []

        for (const campo of Object.keys(camposPermitidos)) {
            if (Object.prototype.hasOwnProperty.call(body, campo)) {
                colunas.push(`${camposPermitidos[campo]} = ?`)
                valores.push(
                    campo === "senha"
                        ? bcrypt.hashSync(body[campo], 10)
                        : body[campo]
                )
            }
        }

        if (colunas.length === 0) {
            return res.status(400).json({
                erro: "Informe pelo menos um campo válido para atualizar"
            })
        }

        valores.push(req.params.id)
        const [resultado] = await db.pool.query(
            `UPDATE clientes SET ${colunas.join(", ")} WHERE id = ?`,
            valores
        )

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: "Cliente não encontrado" })
        }

        return res.status(200).json({
            mensagem: "Cliente atualizado com sucesso"
        })
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ erro: "CPF ou e-mail já cadastrado" })
        }

        return res.status(500).json({ erro: error.message })
    }
})

app.delete("/clientes/:id", async (req, res) => {
    try {
        const [resultado] = await db.pool.query(
            "DELETE FROM clientes WHERE id = ?",
            [req.params.id]
        )

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: "Cliente não encontrado" })
        }

        return res.status(200).json({
            mensagem: "Cliente excluído com sucesso"
        })
    } catch (error) {
        return res.status(500).json({ erro: error.message })
    }
})

app.listen(porta, () => {
    console.log(`API de clientes rodando na porta ${porta}`)
})
