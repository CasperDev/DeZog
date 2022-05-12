import {Utility} from "../../misc/utility";
import {MemoryModel} from "./memorymodel";


/**
 * Contains the predefined memory models for ZX16k, ZX48K, ZX128 and ZXNext
 */


/**
 * Default model for MAME.
 * Nothing known.
 */
export class MemoryModelUnknown extends MemoryModel {
	constructor() {
		super({
			slots: [
				{
					range: [0x0000, 0xFFFF],
					banks: [
						{
							index: 0,
							name: 'UNKNOWN'
						}
					]
				}
			]
		});
		this.name = 'UNKNOWN';
	}
}


/**
 * Model with all RAM.
 */
export class MemoryModelAllRam extends MemoryModel {
	constructor() {
		super({
			slots: [
				{
					range: [0x0000, 0xFFFF],
					banks: [
						{
							index: 0,
							name: 'RAM'
						}
					]
				}
			]
		});
		this.name = 'RAM';
	}
}


/**
 * ZX Spectrum base definition.
 */
export class MemoryModelZxSpectrumBase extends MemoryModel {
	// Bank used for the ULA output.
	public ulaBank: number;

	// Switches the bank for the ULA screen.
	public switchUlaBank(shadowBank: boolean) {
		// Overwrite.
	}
}


/**
 * ZX16K
 * ROM + RAM, above 0x8000 unassigned.
 */
export class MemoryModelZx16k extends MemoryModelZxSpectrumBase {
	constructor() {
		super({
			slots: [
				{
					range: [0x0000, 0x3FFF],
					banks: [
						{
							index: 0,
							name: 'ROM',
							rom: Utility.getExtensionPath() + '/data/48.rom'
						}
					]
				},
				{
					range: [0x4000, 0x7FFF],
					banks: [
						{
							index: 1,
							name: 'RAM'
						}
					]
				},
			]
		});
		this.name = 'ZX16K';
		this.ulaBank = 1;
	}
}


/**
 * ZX48K
 * 16K ROM + 48K RAM
 */
export class MemoryModelZx48k extends MemoryModelZxSpectrumBase {
	constructor() {
		super({
			slots: [
				{
					range: [0x0000, 0x3FFF],
					banks: [
						{
							index: 0,
							name: 'ROM',
							rom: Utility.getExtensionPath() + '/data/48.rom'
						}
					]
				},
				{
					range: [0x4000, 0xFFFF],
					banks: [
						{
							index: 1,
							name: 'RAM'
						}
					]
				},
			]
		});
		this.name = 'ZX48K';
		this.ulaBank = 1;
	}
}


/**
 * ZX128K
 * 8 RAM banks a 16k.
 * 2 ROMs
 */
export class MemoryModelZx128k extends MemoryModelZxSpectrumBase {
	constructor(ramBanks = 8) {
		super({
			slots: [
				{
					range: [0x0000, 0x3FFF],
					name: "slotROM",
					initialBank: 8,
					banks: [
						{
							index: 8,
							name: 'ROM0',
							shortName: 'R0',
							rom: Utility.getExtensionPath() + '/data/128.rom' 	// 128k editor
						},
						{
							index: 9,
							name: 'ROM1',
							shortName: 'R1',
							rom: Utility.getExtensionPath() + '/data/48.rom'
						}
					]
				},
				{
					range: [0x4000, 0x7FFF],
					banks: [
						{
							index: 5
						}
					]
				},
				{
					range: [0x8000, 0xBFFF],
					banks: [
						{
							index: 2
						}
					]
				},
				{
					range: [0xC000, 0xFFFF],
					name: "slotC000",
					initialBank: 0,
					banks: [
						{
							index: [0, ramBanks-1],
						}
					]
				}
			],
			ioMmu: [
				"var disabled;",
				"if((portAddress | 0x7FFD) == 0x7FFD && !disabled) {",
				"  slotC000 = portValue & 0x07; // RAM block select",
				"  disabled = portValue & 0b0100000; // DIS",
				"  slotROM = ((portValue & 0b0010000) >>> 4) + 8;",
				"}"
			]
		});
		this.name = 'ZX128K';
		this.switchUlaBank(false);
	}


	// Switches the bank for the ULA screen.
	public switchUlaBank(shadowBank: boolean) {
		this.ulaBank = (shadowBank) ? 7 : 5;
	}

}


/**
 * ZX256K
 * 16 RAM banks a 16k.
 * 2 ROMs
 */
/*
Too many clones: https://zx-pk.ru/threads/11490-paging-ports-of-zx-clones.html?langid=1
I think I leave it with the ZX128K.
export class MemoryModelZx256k extends MemoryModelZx128k {
	constructor() {
		super(16);	// 16 RAM banks
		this.name = 'ZX256K';
		this.ioMmu = [
			"var disabled;",
			"if((portAddress | 0x7FFD) == 0x7FFD && !disabled) {",
			"  slotC000 = portValue & 0x07; // RAM block select",
			"  disabled = portValue & 0b0100000; // DIS",
			"  slotROM = ((portValue & 0b0010000) >>> 4) + 8;",
			"}"
		].join('\n');
	}
}
*/


/**
 * The ZX Next memory model:
 * 8 slots per 8k.
 * 0000-1FFF: RAM/ROM
 * 2000-3FFF: RAM/ROM
 * 4000-5FFF: RAM
 * 6000-7FFF: RAM
 * 8000-9FFF: RAM
 * A000-BFFF: RAM
 * C000-DFFF: RAM
 * E000-FFFF: RAM
 * The unexpanded ZXNext has 0-95 8k banks.
 * The expanded has: 0-223 8k banks.
 * Banks 0xFC to 0xFF are ROM.
 * Note: 0xFC, FD, FE are invented, in a ZxNext there is only 0xFF.
 * ROM0, lower 2k: 0xFC
 * ROM0, upper 2k: 0xFD
 * ROM1, lower 2k: 0xFE
 * ROM1, upper 2k: 0xFF
 */
export class MemoryModelZxNext extends MemoryModelZxSpectrumBase {
	constructor() {
		super({
			slots: [
				{
					range: [0x0000, 0x1FFF],
					initialBank: 0xFE,
					banks: [
						{
							index: [0, 223],	// 254  RAM banks
						},
						{
							index: 0xFC,
							name: 'ROM0',
							shortName: 'R0a',
							rom: Utility.getExtensionPath() + '/data/128.rom' 	// 1
						},
						{
							index: 0xFE,
							name: 'ROM1',
							shortName: 'R1a',
							rom: Utility.getExtensionPath() + '/data/48.rom'
						},
					]
				},
				{
					range: [0x2000, 0x3FFF],
					initialBank: 0xFF,
					banks: [
						{
							index: [0, 223],	// All banks are already defined in previous range
						},
						{
							index: 0xFD,
							name: 'ROM0',
							shortName: 'R0b',
							rom: Utility.getExtensionPath() + '/data/128.rom',
							romOffset: 0x2000
						},
						{
							index: 0xFF,
							name: 'ROM1',
							shortName: 'R1b',
							rom: Utility.getExtensionPath() + '/data/48.rom',
							romOffset: 0x2000
						},
					]
				},
				{
					range: [0x4000, 0x5FFF],
					initialBank: 10,
					banks: [{index: [0, 255]}]
				},
				{
					range: [0x6000, 0x7FFF],
					initialBank: 11,
					banks: [{index: [0, 223]}]
				},
				{
					range: [0x8000, 0x9FFF],
					initialBank: 4,
					banks: [{index: [0, 223]}]
				},
				{
					range: [0xA000, 0xBFFF],
					initialBank: 5,
					banks: [{index: [0, 223]}]
				},
				{
					range: [0xC000, 0xDFFF],
					initialBank: 0,
					banks: [{index: [0, 223]}]
				},
				{
					range: [0xE000, 0xFFFF],
					initialBank: 1,
					banks: [{index: [0, 223]}]
				}
			],
			// ioMmu is undefined because memory management is implemented programmatically.
			// The writing of the the slot register would be possible to implement here,
			// but the port also needs to support reading of the register,
			// what cannot be supported here.
		});
		this.name = 'ZXNEXT';
		this.switchUlaBank(false);
	}


	// Switches the bank for the ULA screen.
	public switchUlaBank(shadowBank: boolean) {
		this.ulaBank = (shadowBank) ? 2*7 : 2*5;
	}
}
