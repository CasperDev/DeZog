import { Settings } from './../src/settings/settings';
import * as assert from 'assert';
import {DisassemblyClass} from '../src/disassembly/disassembly';


suite('Disassembly (DisassemblyClass)', () => {

	suite('DisassemblyClass', () => {

		setup(() => {
			const cfgEmpty: any = {
				"disassemblerArgs": {
					"esxdosRst": true
				}
			};
			Settings.launch = Settings.Init(cfgEmpty);
		});

		test('slotsChanged', () => {
			const dis = new DisassemblyClass() as any;

			assert.ok(dis.slotsChanged([1]));

			dis.setSlots([1]);
			assert.ok(!dis.slotsChanged([1]));

			assert.ok(dis.slotsChanged([1, 2]));
			dis.setSlots([1, 2]);
			assert.ok(!dis.slotsChanged([1, 2]));

			assert.ok(dis.slotsChanged([1, 3]));
			assert.ok(dis.slotsChanged([3, 1]));
		});
	});
});

