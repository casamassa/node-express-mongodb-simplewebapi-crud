global.db = require('./db')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const port = 3000 //porta padrão
const SECRET = 'marcelocasa'

app.use(bodyParser.urlencoded({ extended:true }))
app.use(bodyParser.json())

//definindo as rotas
const router = express.Router()
router.get('/', (req, res) => res.json({
		message: 'Funcionando!' 
	}))
	
// GET /clientes
router.get('/clientes', verifyJWT, (req, res) => global.db.findCustomers((err, docs) => {
		console.log(req.userId + ' fez esta chamada!')
		if(err) 
			res.status(500).json(err)
		else 
			res.json(docs)
	}))
	
// GET /clientes/{id}
router.get('/clientes/:id', (req, res) => global.db.findCustomer(req.params.id, (err, doc) => {
	if(err) 
		res.status(500).json(err)
	else 
		res.json(doc)
}))

// POST /clientes
router.post('/clientes', (req, res) => {
	const customer = req.body
	global.db.insertCustomer(customer, (err, result) => {
		if(err) 
			res.status(500).json(err)
		else 
			res.json({ message: 'Cliente cadastrado com sucesso!'})
	})
})

// PUT /clientes/{id}
router.put('/clientes/:id', (req, res) => {
	const id = req.params.id
	const customer = req.body
	global.db.updateCustomer(id, customer, (err, result) => {
		if(err) 
			res.status(500).json(err)
		else 
			res.json({ message: 'Cliente atualizado com sucesso!'})
	})
})

// PATCH /clientes/{id}
router.patch('/clientes/:id', (req, res) => {
	const id = req.params.id
	const updates = req.body
	global.db.patchCustomer(id, updates, (err, result) => {
		if(err) 
			res.status(500).json(err)
		else 
			res.json({ message: 'Cliente atualizado com sucesso!'})
	})
})

// DELETE /clientes/{id}
router.delete('/clientes/:id', (req, res) => {
	const id = req.params.id
	global.db.deleteCustomer(id, (err, result) => {
		if(err) 
			res.status(500).json(err)
		else 
			res.json({ message: 'Cliente excluído com sucesso!'})
	})
})


function verifyJWT(req,res, next) {
	const token = req.headers['x-access-token']
	const index = blacklist.findIndex(item => item === token) // verificando se o token nao esta na lista do logout
	
	if (index !== -1) return res.status(401).end()
	jwt.verify(token, SECRET, (err, decoded) => {
		if (err) return res.status(401).end()

		req.userId = decoded.userId
		next()
	})
}

router.post('/login', (req,res)  => {
	if (req.body.user === 'luiz' && req.body.password === '123') { // o login foi feita de uma forma fixa apenas pra simular, o ideal é que a checagem do login e senha seja feita em uma base de dados, pode-se usar o passport por ex 
		const token = jwt.sign({userId:1}, SECRET, {expiresIn: 300})
		return res.json({auth: true, token})
	}
	res.status(401).end()
})


//a implementacao do logout e apenas pra ter uma ideia foi guardada em memoria, mas podemos usar o redis cache, ou mongodb, ou no banco mysql por ex, o mongodb tem o ttlindex q é um tipo de dado q ele some sozinho da base de dados depois de um tempo evitando que fique muito grande
const blacklist = []
router.post('/logout', (req,res) => {
	blacklist.push(req.headers['x-access-token'])
	res.end()
})

app.use('/', router)

//inicia o servidor
app.listen(port)
console.log('API funcionando!')