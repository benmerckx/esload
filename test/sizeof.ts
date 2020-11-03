import image from './test.jpg'
import {suite} from 'uvu'
import * as assert from 'uvu/assert'
import fs from 'fs'

const test = suite('sizeof')

test('size', () => {
	assert.equal(image.width, 636)
	assert.equal(image.height, 900)
	assert.ok('./' + fs.existsSync(image.src.split('/').pop()))
})

test.run()
