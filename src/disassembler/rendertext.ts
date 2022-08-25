import {AsmNode} from "./asmnode";
import {Format} from "./format";
import {RenderBase} from "./renderbase";
import {RenderedLines} from "./renderedlines";
import {SmartDisassembler} from "./smartdisassembler";
import {Subroutine} from "./subroutine";



/** Class to render disassembly text.
 */
export class RenderText extends RenderBase {

	/// Column areas. E.g. area for the bytes shown before each command
	public clmnsAddress = 5;		///< size for the address at the beginning of each line.
	public clmnsBytes = 4 * 3 + 1;	///< 4* length of hex-byte

	// The max. number of bytes to print in a data DEFB area per line.
	public defbMaxBytesPerLine = 8;

	// Helper array. During processing this array is filled with all the instruction's
	// data references. 'dataReferencesIndex' points to the currently in use address.
	protected dataReferences: number[] = [];


	/** A function that is called on every disassembled line.
	 * It will associate the code lines with addresses.
	 * Only used for the normal text disassembly.
	 * Not by call graph, flow chart or html disassembly.
	 * Is set by the constructor.
	 * @param line The file's line number (starting at 0).
	 * @param addr64k The address.
	 * @param bytesCount The number of bytes. Every address will be associated with the line number.
	 */
	protected funcLineAddressAssociation?: (lineNr: number, addr64k: number, bytesCount: number) => void;


	/** Constructor.
	 */
	constructor(disasm: SmartDisassembler, funcLineAddressAssociation?: (lineNr: number, addr64k: number, bytesCount: number) => void) {
		super(disasm);
		this.funcLineAddressAssociation = funcLineAddressAssociation;
	}


	/** Formatting of a label at the start of a line ("LABEL:")
	 * @param label E.g. "LABEL"
	 * @return E.g. "<b>LABEL</b>"
	 * Override.
	 */
	protected emphasizeLabel(label: string): string {
		return label;
	}



	/** Surrounds the text with html <span></span> to change the background color
	 * to emphasize the item.
	 * @param text The text to surround.
	 * @returns E.g. '<span style="background:var(--vscode-editor-selectionBackground);color:var(--vscode-editor-foreground);font-weight:bold">8000 main:'</span>'
	 * Override.
	 */
	protected emphasizeStartLabel(text: string): string {
		return text;
	}


	/** Surrounds the text with html <span></span> to emphasize the comment.
	 * @param comment The text to surround. E.g. "; Note: bla bla"
	 * @returns E.g. '<span style="background:var(--vscode-editor-selectionBackground);color:var(--vscode-editor-selectionForeground);font-weight:bold">; Note: bla bla</span>'
	 * Override.
	 */
	protected emphasizeComment(comment: string): string {
		return comment;
	}


	/** Surrounds the text with html <a></a> with href that points to the given address.
	 * @param text The text to surround.
	 * @param addr64k The address to add as a reference.
	 * @returns E.g. '<a href="#8000">8000 main:</a>'
	 */
	protected addReferences(text: string, addr64k: number): string {
		return text;
	}


	/** Returns a formatted line with address and label.
	 * With right clmns spaces.
	 * @param addr64k The address for the line. Is converted into a long address.
	 * @param label A text to add. Usually the decoded instruction.
	 * @returns A complete line, e.g. "C000.B1 LABEL1:"
	 */
	protected formatAddressLabel(addr64k: number, label: string): string {
		const addrString = (this.disasm.funcFormatLongAddress(addr64k)).padEnd(this.clmnsAddress - 1) + ' ';
		// Make non local labels bold
		if (!label.startsWith('.'))
			label = this.emphasizeLabel(label);
		const s = addrString + label + ':';
		return s;
	}


	/** Returns a formatted line with address bytes and text/opcode.
	 * With right clmns spaces.
	 * @param addr64k The address for the line. Is converted into a long address.
	 * @param bytes The byte to add for the line. Can be empty.
	 * @param text A text to add. Usually the decoded instruction.
	 * @returns A complete line, e.g. "C000.B1 3E 05    LD A,5"
	 */
	protected formatAddressPlusText(addr64k: number, bytes: Uint8Array, text: string): string {
		const addrString = this.disasm.funcFormatLongAddress(addr64k).padEnd(this.clmnsAddress - 1);
		let bytesString = '';
		bytes.forEach(value =>
			bytesString += value.toString(16).toUpperCase().padStart(2, '0') + ' '
		);
		bytesString = bytesString.substring(0, bytesString.length - 1);
		bytesString = Format.getLimitedString(bytesString, this.clmnsBytes - 2);
		const s = addrString + ' ' + bytesString + '  ' + text;
		return s;
	}


	/**
	 * Formats a series of bytes into a comment string.
	 * @param bytes The data to print.
	 * @returns All hex data is converted to ASCII. Non-printable characters are displayed as '?'.
	 * E.g. 'mystring'
	 */
	protected getDefbComment(bytes: Uint8Array): string {
		let result = '';
		for (const byte of bytes) {
			// Check if printable ASCII
			const printable = (byte >= 0x20) && (byte < 0x80);
			// Add to string
			if (printable) {
				const c = String.fromCharCode(byte);
				result += c;
			}
			else {
				// Non-printable
				result += '?'
			}
		}
		// Return
		return "ASCII: " + result;
	}


	/** Returns a line of DEFB data.
	 * @param bytes The data to print.
	 * @returns E.g. 'DEFB C0 AF 01'
	 */
	protected getDefbLine(bytes: Uint8Array) {
		let bytesString = '';
		bytes.forEach(value => {
			bytesString += ' ' + value.toString(16).toUpperCase().padStart(2, '0');
		});
		return 'DEFB' + bytesString;
	}


	/** Returns a complete line of data.
	 * With address and comment.
	 * @param addr64k The start address.
	 * @param len The amount of bytes.
	 * @returns E.g. '8000.1 C0 AF...  DEFB C0 AF 01 CE  ; ASCII: ????'
	 */
	protected getCompleteDataLine(addr64k: number, len: number) {
		const bytes: Uint8Array = this.disasm.memory.getData(addr64k, len);
		let text = this.getDefbLine(bytes);
		text += ' ; ' + this.getDefbComment(bytes);
		const line = this.formatAddressPlusText(addr64k, bytes, text);
		return line;
	}


	/** Creates a string with address and label information.
	 * The label is colored, if it is a start node
	 * @param E.g. E.g. 0x8000
	 * @param label E.g. "LABEL1"
	 * @returns E.g. "<a href="#8000">C0001.1 LABEL1:</a>"
	 */
	protected getAddressLabel(addr64k: number, label: string): string {
		let labelText = this.formatAddressLabel(addr64k, label);
		// Add href
		labelText = this.addReferences(labelText, addr64k);
		return labelText;
	}


	/** Print comments for addresses.
	 * If comments do exist.
	 * @param lines The comments are put in here.
	 * @param addr64k The address.
	 * @param len The range of addresses to check. [addr64k, addr64k+len-1]
	 */
	protected printComments(lines: RenderedLines, addr64k: number, len: number) {
		const cmnts = this.disasm.comments.getCommentsForAddresses(addr64k, len);
		if (cmnts.length > 0) {
			lines.addNewline();
			cmnts.forEach(c =>
				lines.addLine(this.emphasizeComment('; Note: ' + c)));
		}
	}


	/** Adds a disassembly data block.
	 * It prints only data with labels.
	 * I.e. for each found label it prints at least 8 bytes of data
	 * (= 1 line).
	 * @param lines Array of lines. The new text lines are pushed here.
	 * @param addr64k The address to start.
	 * @param dataLen The length of the data to print.
	 */
	protected printData(lines: RenderedLines, addr64k: number, dataLen: number) {
		// Find first address in 'dataReferences'
		let dataAddr = this.dataReferences.at(-1);	// Last item
		if (dataAddr == undefined) {
			return;
		}

		// Pop until first address in area is found
		while (dataAddr < addr64k) {
			dataAddr = this.dataReferences.pop();
			if (dataAddr == undefined) {
				return;
			}
		}

		// Get end address
		let endAddr = addr64k + dataLen;
		if (endAddr > 0x10000)
			endAddr = 0x10000;

		// Continue until area is left
		while (dataAddr < endAddr) {
			// Label is in printed area
			this.dataReferences.pop();
			// Check distance to next label:
			let nextDataAddr = this.dataReferences.at(-1);	// Last item
			while (nextDataAddr == dataAddr) {
				// Skip same addresses
				this.dataReferences.pop();
				nextDataAddr = this.dataReferences.at(-1);
			}
			let countBytes = this.defbMaxBytesPerLine;
			if (nextDataAddr != undefined) {
				const diffToNext = nextDataAddr - dataAddr;
				if (countBytes > diffToNext)
					countBytes = diffToNext;
			}
			const diffToEnd = endAddr - dataAddr;
			if (countBytes > diffToEnd)
				countBytes = diffToEnd;

			// Print the label
			const label = this.disasm.getLabelForAddr64k(dataAddr)!;
			//Utility.assert(label);
			if (label) {
				// Is e.g. not defined if in different bank.
				const addressLabel = this.getAddressLabel(dataAddr, label);
				lines.addLine(addressLabel);
			}

			// Print the data
			const line = this.getCompleteDataLine(dataAddr, countBytes);
			lines.addLine(line);

			// Check for end
			if (nextDataAddr == undefined)
				break;

			// Next
			dataAddr = nextDataAddr;
		}

		// Add new line only if something was added.
		lines.addNewline();
	}


	/** ANCHOR Renders the disassembly text.
	 * @param startNodes The nodes to disassemble.
	 * @param depth The (max) depth to render.
	 * @returns The disassembled text.
	 */

	public renderSync(startNodes: AsmNode[], depth: number): string {
		// Render
		const rendered = this.renderForDepth(startNodes, depth);
		return rendered;
	}


	/** ANCHOR Renders for a particular depth.
	 * @param startNodes The nodes to disassemble.
	 * @param depth The depth to render.
	 * @returns The disassembled text.
	 */
	public renderForDepth(startNodes: AsmNode[], depth: number): string {
		// Get all nodes for the depth
		const nodesForDepth = new Set<AsmNode>();
		for (const node of startNodes) {
			const sub = new Subroutine(node);
			sub.getAllNodesRecursively(depth, nodesForDepth);
		}
		// Render
		const rendered = this.renderNodes(nodesForDepth, startNodes);
		return rendered;
	}


	/** ANCHOR Renders all given nodes to text.
	 * @param nodeSet The nodes to disassemble. The nodes will be sorted by start address.
	 * @param startNodes The start node labels are rendered in a different color.
	 * @returns The disassembly text.
	 */
	public renderNodes(nodeSet: Set<AsmNode>, startNodes: AsmNode[] = []): string {
		// Sort the nodes
		const nodes = Array.from(nodeSet); //.filter(node => (node.length > 0));	// Filter nodes in other banks
		nodes.sort((a, b) => a.start - b.start);

		// Now get all data references (for the nodes = for the depth)
		this.dataReferences = [];
		for (const node of nodes) {
			this.dataReferences.push(...node.dataReferences);
		}
		this.dataReferences.sort((a, b) => b - a); // 0 = highest

		// Loop over all nodes
		const lines = new RenderedLines();
		let addr64k = 0x0000;
		for (const node of nodes) {
			// Get node address
			const nodeAddr = node.start;

			// Print data between nodes
			const dataLen = nodeAddr - addr64k;
			if (dataLen > 0) {
				this.printData(lines, addr64k, dataLen);
			}
			addr64k = nodeAddr;

			// Associate line and address
//			this.funcLineAddressAssociation?.(lines.length(), addr64k, 1); // Doesn'T seem necessary, would be for the label only.

			// Disassemble node
			let i = 0;
			for (const opcode of node.instructions) {

				// First print comment(s)
				this.printComments(lines, addr64k, opcode.length);

				// Check if label exists
				const label = this.disasm.getLabelForAddr64k(addr64k);
				if (label) {
					let labelText = this.getAddressLabel(addr64k, label);
					if (i == 0) {
						// Check if it is a start node
						if (startNodes.includes(node)) {
							// Color the node label
							labelText = this.emphasizeStartLabel(labelText);
						}
					}
					// Store
					lines.addLine(labelText);
				}

				// Associate line and address
				this.funcLineAddressAssociation?.(lines.length(), addr64k, opcode.length);

				// Now disassemble instruction
				const len = opcode.length;
				const bytes = this.disasm.memory.getData(addr64k, len);
				const instructionText = this.formatAddressPlusText(addr64k, bytes, opcode.disassembledText);
				const hrefInstrText = this.addReferences(instructionText, addr64k);
				lines.addLine(hrefInstrText);


				// Next
				addr64k += len;
			}

			// Separate blocks
			lines.addNewline();
		}

		// Print data after last node
		const dataLen = 0x10000 - addr64k;
		if (dataLen > 0) {
			this.printData(lines, addr64k, dataLen);
		}

		// Return
		const text = lines.getText();
		return text;
	}
}
