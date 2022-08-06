
	DEFS 0x0000
	; Simple block
	PUSH HL
	INC HL
	LD A,B
	INC A
	LD (HL),A
	POP HL
	RET


	DEFS 0x0100-$
	; 1 branch, glocal label
	LD A,5
	CP B
	JR Z,LBL_0107

	NEG

LBL_0107:
	RET

	DEFS 0x0180-$
	; 1 branch, local label
	CALL SUB_0184
	RET

SUB_0184:
	LD A,5
	CP B
	JR Z,.LL1

	NEG

.LL1:
	RET


	DEFS 0x0200-$
	; JR after RET
	LD A,5
	CP B
	JR Z,SSUB_0209

	NEG
	RET

	NOP

SSUB_0209:
	NOP
	RET


	DEFS 0x0280-$
	; JR after RET, sub
	CALL SSUB_0284
	RET

SSUB_0284:
	LD A,5
	CP B
	JR Z,LLBL_028D

	NEG
	RET

	NOP

LLBL_028D:
	NOP
	RET


	DEFS 0x0300-$
	; Sub in sub
	CALL SSUB_0307
	CALL SSUB_0309
	RET

SSUB_0307:
	LD A,5
SSUB_0309:
	INC A
	RET



	DEFS 0x0400-$
	; Complex jumping
	CALL SSUB_0404
	RET

SSUB_0404:
	LD A,5
	JP Z,.LL2

	RET

.LL1:
	NOP
	RET

.LL2:
	JP C,.LL1

	NEG
	RET


	DEFS 0x0500-$
	; 2 subs, sharing block
	CALL SSUB_0507
	CALL SSUB_0520
	RET

SSUB_0507:
	LD A,5

.LL1:
	NEG
	RET

	DEFS 0x0520-$
SSUB_0520:
	LD A,6
	JP SSUB_0507.LL1


	DEFS 0x0600-$
	; Loop
	CALL SSUB_0604
	RET

SSUB_0604:
	LD A,5

.LLOOP:
	INC A
	DJNZ .LLOOP

	RET


	DEFS 0x0700-$
	; Nested loops
	CALL SSUB_0704
	RET

SSUB_0704:
	LD A,5

.LLOOP1:
	INC HL

.LLOOP2:
	INC DE
	DJNZ .LLOOP2

	DEC A
	JR NZ,.LLOOP1

	RET


	DEFS 0x0800-$
	; Nested loops, same label
	CALL SSUB_0804
	RET

SSUB_0804:
	LD A,5

.LLOOP:
	INC HL
	INC DE
	DJNZ .LLOOP

	DEC A
	JR NZ,.LLOOP

	RET


	DEFS 0x1000-$
	; Recursive call
SUB_REC:
	CP 0
	RET Z

	DEC A
	CALL SUB_REC

	RET


	DEFS 0x1100-$
	; JP
	CALL SUB_1104
	RET

SUB_1104:
	LD A,5
	JP .LL1
.LL1:
	RET


	DEFS 0x1200-$
	NOP

LLB_1201:
	JR $


	DEFS 0x1300-$
	CALL LLBL_1304
	RET

LLBL_1304:
	NOP

.LLOOP:
	JR $	; LLOOP
