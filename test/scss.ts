import styles from './index.module.scss'
import {suite} from 'uvu'
import * as assert from 'uvu/assert'
import fs from 'fs'

const test = suite('scss')

test('scss', () => {
	assert.type(styles._getContent().default.locals.index, 'string')
})

test.run()
