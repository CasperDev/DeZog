import {Utility} from '../../misc/utility';
import {PagedMemory} from './pagedmemory';
import * as fs from 'fs';
import {BankType} from './simmemory';


/**
 * Represents the memory of a ZX Next.
 * Especially sets the ROM area and
 * the initial slot/bank configuration.
 */
export class ZxNextMemory extends PagedMemory {

	/// Constructor.
	constructor() {
		super(8, 256);
		// ROM is located in banks 0xFE and 0xFF.
		// In real ZX Next both is mapped to 0xFF and distinguished by the slot.
		// Bank 0-253 are RAM.
		// Note: the real ZX Next does not offer so many RAM banks.
		this.typeOfBanks[0xFE] = BankType.ROM;
		this.typeOfBanks[0xFF] = BankType.ROM;
		// Bank configuration
		this.slots = [0xFE, 0xFF, 10, 11, 4, 5, 0, 1];
		// Load the  ROM
		const romFilePath = Utility.getExtensionPath() + '/data/48.rom';
		const romBuffer = fs.readFileSync(romFilePath);
		const size = 0x2000;
		const rom_a = new Uint8Array(romBuffer.buffer, 0, size); /* 128 editor */
		const rom_b = new Uint8Array(romBuffer.buffer, size, size); /* ZX 48K */
		this.writeBank(0xFE, rom_a);
		this.writeBank(0xFF, rom_b);
	}

}

