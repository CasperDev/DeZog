import {Utility} from '../../misc/utility';
import {RegisterData} from '../decoderegisterdata';
import {Z80RegistersStandardDecoder} from '../z80registersstandarddecoder';



// The index into the data string for certain registers.
enum MAME_REG {
	AF = 0,
	BC = 4,
	DE = 8,
	HL = 12,
	AF2 = 16,
	BC2 = 20,
	DE2 = 24,
	HL2 = 28,
	IX = 32,
	IY = 36,
	SP = 40,
	PC = 44
}


/**
 * Parses the register data received from the MAME gdbstub.
 * The register data is stored as hex values in the data string.
 * The index into the string depends on the register.
 */
export class Z80RegistersMameDecoder extends Z80RegistersStandardDecoder {

	/**
	 * General parse function from index.
	 * @param data The output from Mame.
	 * @param index The index into the data string.
	 * @returns The value.
	 */
	public parse(data: RegisterData, index: MAME_REG): number {
		return Utility.parseHexWordLE(data, index);
	}


	/**
	 * Parses the register output for PC etc.
	 * @param data The output from Mame.
	 * @returns The value.
	 */
	public parsePC(data: RegisterData): number {
		return this.parse(data, MAME_REG.PC);
	}

	public parseSP(data: RegisterData): number {
		return this.parse(data, MAME_REG.SP);
	}

	public parseAF(data: RegisterData): number {
		return this.parse(data, MAME_REG.AF);
	}

	public parseBC(data: RegisterData): number {
		return this.parse(data, MAME_REG.BC);
	}

	public parseHL(data: RegisterData): number {
		return this.parse(data, MAME_REG.HL);
	}

	public parseDE(data: RegisterData): number {
		return this.parse(data, MAME_REG.DE);
	}

	public parseIX(data: RegisterData): number {
		return this.parse(data, MAME_REG.IX);
	}

	public parseIY(data: RegisterData): number {
		return this.parse(data, MAME_REG.IY);
	}

	public parseAF2(data: RegisterData): number {
		return this.parse(data, MAME_REG.AF2);
	}

	public parseBC2(data: RegisterData): number {
		return this.parse(data, MAME_REG.BC2);
	}

	public parseHL2(data: RegisterData): number {
		return this.parse(data, MAME_REG.HL2);
	}

	public parseDE2(data: RegisterData): number {
		return this.parse(data, MAME_REG.DE2);
	}

	public parseI(data: RegisterData): number {
		// TODO: not supported. Report differently?
		return 0;
	}

	public parseR(data: RegisterData): number {
		// TODO: not supported. Report differently?
		return 0;
	}

	public parseIM(data: RegisterData): number {
		// TODO: not supported. Report differently?
		return 0;
	}

	public parseSlots(data: RegisterData): number[] {
		// TODO: Do I use this ? What about parsePCLong?
		return [];
	}

}

