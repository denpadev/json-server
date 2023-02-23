const express = require('express')
const app = express()
const fs = require('fs')
const { EventEmitter } = require('events')
const dbPath = './database/database.json'

class Stater extends EventEmitter {
	constructor(props) {
		super(props)
		this.state = true
	}

	setState(newState) {
		this.state = newState || false
		this.emit('set', newState)
	}

	waitForTrue(newState) {
		return new Promise(resolve => {
			let check = () => {
				if (this.state) {
					this.off('set', check)
					resolve()
				}
			}
			this.on('set', check)
			check()
		})
	}
}
const isOpen = new Stater

app.get('/', async (req, res) => {
	res.setHeader('Content-Type', 'application/json')
	await isOpen.waitForTrue()
	isOpen.setState(false)
	fs.createReadStream(dbPath).pipe(res)
	isOpen.setState(true)
})

app.listen(process.env.PORT || 3000)
