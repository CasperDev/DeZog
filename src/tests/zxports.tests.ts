
import * as assert from 'assert';
import {ZxPorts} from '../remotes/zxsimulator/zxports';

suite('ZxPorts', () => {
	test('readState/writeState', () => {
		let state;
		{
			const ports=new ZxPorts();

			// Set ports
			ports.setPortValue(0x0000, 100);
			ports.setPortValue(0x0095, 101);
			ports.setPortValue(0x8000, 102);
			ports.setPortValue(0xFFFF, 103);

			// Read
			state=ports.readState();

			// Check length
			let length=0x10000+4;
			assert.equal(length, state.length);
		}

		// Create a new object
		const rPorts=new ZxPorts();
		rPorts.writeState(state);

		// Test the ports
		assert.equal(100, rPorts.read(0x0000));
		assert.equal(101, rPorts.read(0x0095));
		assert.equal(102, rPorts.read(0x8000));
		assert.equal(103, rPorts.read(0xFFFF));
	});

});
