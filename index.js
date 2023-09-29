const express = require('express')
const verifier = require('@gradeup/email-verify')
const bcrypt = require('bcrypt')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3000
const {v4: uuidv4} = require('uuid');
const expressWs = require('express-ws')(app);

// Add Swagger UI
const swaggerUi = require('swagger-ui-express');
const yamlJs = require('yamljs');
const {verifyEmailDomain} = require("email-domain-verifier");
const swaggerDocument = yamlJs.load('./swagger.yml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.static('public'))
app.use(express.json())

app.ws('/', function(ws) {
    ws.on('message', function(msg) {
        expressWs.getWss().clients.forEach(client => client.send(msg));
    });
});

const users = [
    {id: 1, email: 'admin', password: '$2b$10$NSGEJTcVuxP4Jb3yV0Fd8e4KCIXqqhf85Tu4txSuRi1Hd3iiEGvC2'} // admin123
]

const recipes = [
    {
        id: 1,
        title: 'Example 1',
        content: 'This is the content of example recipe 1',
        userId: 1
    },
    {
        id: 2,
        title: 'Example 2',
        content: 'This is the content of example recipe 2',
        userId: 2
    },
    {
        id: 3,
        title: 'Example 3',
        content: 'This is the content of example recipe 3',
        userId: 1
    }
]

let sessions = [
    // {id: '123', userId: 1}
]

const delay = ms => new Promise(res => setTimeout(res, ms));

function tryToParseJson(jsonString) {
    try {
        var o = JSON.parse(jsonString);
        if (o && typeof o === "object") {
            return o;
        }
    } catch (e) {
    }
    return false;
}

app.post('/users', async (req, res) => {

    // Validate email and password
    if (!req.body.email || !req.body.password) return res.status(400).send('Email and password are required')
    if (req.body.password.length < 8) return res.status(400).send('Password must be at least 8 characters long')
    if (!req.body.email.match(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)) return res.status(400).send('Email must be in a valid format')

    // Check if email already exists
    if (users.find(user => user.email === req.body.email)) return res.status(409).send('Email already exists')

    // Try to contact the mail server and send a test email without actually sending it
    try {
        const result = await verifyEmailDomain(req.body.email, {smtpNotRequired: process.env.EMAIL_VERIFY_SMTP_NOT_REQUIRED === 'true'})

        if (!result.verified) {
            return res.status(400).send('Invalid Email:' + result.info)
        }
        console.log('Email verified')
    } catch (error) {
        const errorObject = tryToParseJson(error)
        if (errorObject && errorObject.info) {
            return res.status(400).send('Invalid email: ' + errorObject.info)
        }
        return res.status(400).send('Invalid email: ' + error)
    }

    // Hash password
    let hashedPassword
    try {
        hashedPassword = await bcrypt.hash(req.body.password, 10);
    } catch (error) {
        console.error(error);
    }

    // Find max id
    const maxId = users.reduce((max, user) => user.id > max ? user.id : max, users[0].id)

    // Save user to database
    users.push({id: maxId + 1, email: req.body.email, password: hashedPassword})

    res.status(201).end()
})

// POST /sessions
app.post('/sessions', async (req, res) => {

    // Validate email and password
    if (!req.body.email || !req.body.password) return res.status(400).send('Email and password are required')

    // Find user in database
    const user = users.find(user => user.email === req.body.email)
    if (!user) return res.status(404).send('User not found')

    // Compare password
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {

            // Create session
            const session = {id: uuidv4(), userId: user.id}

            // Add session to sessions array
            sessions.push(session)

            // Send session to client
            res.status(201).send(session)

        } else {
            res.status(401).send('Invalid password')
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error')
    }
})

function authorizeRequest(req, res, next) {
    // Check that there is an authorization header
    if (!req.headers.authorization) return res.status(401).send('Missing authorization header')

    // Check that the authorization header is in the correct format
    const authorizationHeader = req.headers.authorization.split(' ')
    if (authorizationHeader.length !== 2 || authorizationHeader[0] !== 'Bearer') return res.status(400).send('Invalid authorization header')

    // Get sessionId from authorization header
    const sessionId = authorizationHeader[1]

    // Find session in sessions array
    const session = sessions.find(session => session.id === sessionId)
    if (!session) return res.status(401).send('Invalid session')

    // Check that the user exists
    const user = users.find(user => user.id === session.userId)
    if (!user) return res.status(401).send('Invalid session')

    // Add user to request object
    req.user = user

    // Add session to request object
    req.session = session

    // Call next middleware
    next()
}

app.get('/recipes', authorizeRequest, async (req, res) => {

    await delay(1000)

    // Get recipes for user
    const recipesForUser = recipes.filter(recipe => recipe.userId === req.user.id)

    // Send recipes to client
    res.send(recipesForUser)
})

app.post('/recipes', authorizeRequest, (req, res) => {

    // Validate title and content
    if (!req.body.title || !req.body.content) return res.status(400).send('Title and content are required')

    // Find max id
    const maxId = recipes.reduce((max, recipe) => recipe.id > max ? recipe.id : max, 0)

    // Save recipe to database
    const recipe = {id: maxId + 1, title: req.body.title, content: req.body.content, userId: req.user.id}

    // Add recipe to recipes array
    recipes.push(recipe)

    // Send create event to clients
    expressWs.getWss().clients.forEach(client => client.send(JSON.stringify({event: 'create', recipe})));

    // Send recipe to client
    res.status(201).send(recipes[recipes.length - 1])
})

app.delete('/recipes/:id', authorizeRequest, (req, res) => {

    // Find recipe in database
    const recipe = recipes.find(recipe => recipe.id === parseInt(req.params.id))
    if (!recipe) return res.status(404).send('Recipe not found')

    // Check that the recipe belongs to the user
    if (recipe.userId !== req.user.id) return res.status(401).send('Unauthorized')

    // Remove recipe from recipes array
    recipes.splice(recipes.indexOf(recipe), 1)

    // Send delete event to clients
    expressWs.getWss().clients.forEach(client => client.send(JSON.stringify({event: 'delete', id: recipe.id})));

    res.status(204).end()
})


app.put('/recipes/:id', authorizeRequest, (req, res) => {

    // Validate title and content
    if (!req.body.title || !req.body.content) return res.status(400).send('Title and content are required')

    // Find recipe in database
    const recipe = recipes.find(recipe => recipe.id === parseInt(req.params.id))
    if (!recipe) return res.status(404).send('Recipe not found')

    // Check that the recipe belongs to the user
    if (recipe.userId !== req.user.id) return res.status(401).send('Unauthorized')

    // Update recipe
    recipe.title = req.body.title
    recipe.content = req.body.content

    // Send update event to clients
    expressWs.getWss().clients.forEach(client => client.send(JSON.stringify({event: 'update', recipe})));

    // Send recipe to client
    res.send(recipe)
})

app.delete('/sessions', authorizeRequest, (req, res) => {

    // Remove session from sessions array
    sessions = sessions.filter(session => session.id !== req.session.id)

    res.status(204).end()
})
app.delete('/recipes', authorizeRequest, (req, res) => {

    // Get delete requesters id
    const requesterId = req.user.id

    // Remove all requesters recipes from recipes array
    for (let i = recipes.length - 1; i >= 0; i--) {
        if (recipes[i].userId === req.user.id) {
            recipes.splice(i, 1);
        }
    }

    // Send delete event to clients
    expressWs.getWss().clients.forEach((client) => client.send(JSON.stringify({ event: 'deleteAll', id: requesterId })));

    // Send a response
    res.status(204).end();
});

app.listen(port, () => {
    console.log(`App running at http://localhost:${port}. Documentation at http://localhost:${port}/docs`)
});

function verifyEmail(email) {
    return new Promise((resolve, reject) => {
        verifier.verify(email, (err, info) => {
            console.log(err, info);
            if (err) {
                reject(JSON.stringify(info));
            } else {
                resolve(info);
            }
        });
    });
}