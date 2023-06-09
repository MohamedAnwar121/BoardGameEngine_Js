import GameEngine from "./GameEngine";

class Checkers extends GameEngine{



    constructor(props) {
        super(props);
        this.board.distributePieces = "note: W >> white, B >> black            \n                                             << Enter W OR B >>";

        this.initializeGamePieces();
        this.initializePiecesRules();
        this.initializeComponentState("W");
        console.log('constructor ends.')
    }

    controller(input, state){


        // >>>>>>>>>>>>>>>>>>>>> logic >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

        // 2 cases. i have player who plays
        // [1] current piece = null
        // validate that is a piece of current user.
        // check if the current user can move current piece or not.  >>>>>>> extra case >>>>> if one ate in the previous turn.it only can move
        // [1] can eat using roles.
        // too easy.
        // [2] move without eat.
        // 2 cases.
        // [1] no one can eat.
        // [2] one can eat.
        // [2] current piece = (for Example) white-man
        // check if current press index one of the available for current piece.
        // a.2 base cases.
        // b. state proceed.
        // true remove captured cells of opponent.
        // false alert but no state change.

        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

        console.log('index: in controller')
        let index = this.getInput(input);

        if (index === null) {
            alert("XX not valid input XX");
            return state;
        }

        let source = index[0];
        let dest = index[1];

        let sourceX = source[0], sourceY = source[1];
        let destX = dest[0], destY = dest[1];
        let pieceEats = false;

        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> select source >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

        // validation part.
        console.log( 'in selection step' )
        let playerTurnObj = state.playerState.playerTurn;
        let playerSetObj = state.playerState.playerPieces;
        console.log('no held piece: ' + state.playerState.playerPieces)
        let curPlayerTurnSet = ( (playerTurnObj === this.turn.player1)? playerSetObj.player1 : playerSetObj.player2 );
        if( !curPlayerTurnSet.has( state.grid[sourceX][sourceY] ) ){
            alert('null or opponent piece access');
            return state;
        }

        // check if the current user can move current piece or not part.
        let humanStep = false;
        for (const [key, value] of this.pieceRule[ state.grid[sourceX][sourceY] ].entries()) {
            let destinationPointRow = sourceX + key.move[0];
            let destinationPointCol = sourceY + key.move[1];
            if( key.skip ){
                // exists, empty and opponent in middle
                if(    this.isInRange(destinationPointRow, destinationPointCol, this.board.rows, this.board.cols)
                    && state.grid[destinationPointRow][destinationPointCol] === null
                    && this.checkIfOpponentPiece(playerTurnObj, playerSetObj, (destinationPointRow + sourceX) / 2, (destinationPointCol + sourceY) / 2, state) ){
                    pieceEats = true;
                }

            } else {
                // console.log('humanStep is true when' + destinationPointRow + ' ' + destinationPointCol )
                // exists and empty
                if(    this.isInRange(destinationPointRow, destinationPointCol, this.board.rows, this.board.cols)
                    && state.grid[destinationPointRow][destinationPointCol] === null){
                    humanStep = true;
                }
            }
        }
        if( pieceEats ){
            console.log(' the piece eats: '+pieceEats)
        }
        else if( humanStep ){
            // iterate on all grid cells.
            let anotherEats = false;
            for (let i = 0; i < this.board.rows; i++) {
                for (let j = 0; j < this.board.cols; j++) {

                    // piece of grid cell belongs to cur player
                    if( curPlayerTurnSet.has(state.grid[i][j]) ){
                        // console.log( 'in check others if one can eat' + i + ' ' + j );
                        for (const [key, value] of this.pieceRule[ state.grid[i][j] ].entries()) {
                            let destinationPointRow = i + key.move[0];
                            let destinationPointCol = j + key.move[1];
                            if( key.skip ){
                                console.log (i + " " + j + " " + destinationPointRow + " " + destinationPointCol  + " " +  (destinationPointRow + i) / 2 + " " + (destinationPointCol + j) / 2)
                                // exists, empty and opponent in middle
                                if(    this.isInRange(destinationPointRow, destinationPointCol, this.board.rows, this.board.cols)
                                    && state.grid[destinationPointRow][destinationPointCol] === null
                                    && this.checkIfOpponentPiece(playerTurnObj, playerSetObj, (destinationPointRow + i) / 2, (destinationPointCol + j) / 2, state) ){
                                    anotherEats = true;
                                }
                            }
                        }
                    }
                }
            }

            if( anotherEats ){
                alert('another one can eat');
                return state;
            }
            else {
                console.log("before normal move:")
                console.log(state.playerState.playerPieces)
            }
        }
        else {
            alert('all directions blocked');
            return state;
        }

        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> select destination >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        if( !pieceEats ){

            // iterate on possible moves to check if the user selected cell can move to it.
            let moveEnded = false;
            for (const [key, value] of this.pieceRule[ state.grid[ sourceX ][ sourceY ] ].entries()) {

                let destinationPointRow = sourceX + key.move[0];
                let destinationPointCol = sourceY + key.move[1];
                if( destinationPointRow === destX
                    && destinationPointCol === destY
                    && state.grid[ destinationPointRow ][ destinationPointCol ] === null
                    && !key.skip ){

                    moveEnded = true;
                    state.grid[ destinationPointRow ][ destinationPointCol ] = state.grid[ sourceX ][ sourceY ];
                    state.grid[ sourceX ][ sourceY ] = null;
                    this.stateUpdate(state);

                }
            }

            if( !moveEnded ){
                alert('not a valid destination in normal move.');
                return state;
            }

        }
        else {

            // visited array construction.
            const visitedGrid = Array.from(Array(this.board.rows), () => new Array(this.board.cols).fill(null));
            let validEat = this.DFS(visitedGrid, sourceX, sourceY, sourceX, sourceY, destX, destY, state);
            // remain eating
            if ( validEat ){

                state.grid[ destX ][ destY ] = state.grid[ sourceX ][ sourceY ];
                state.grid[ sourceX ][ sourceY ] = null;
                this.stateUpdate(state);

            } else {

                alert('not a valid destination in eating.');
                return state;
            }
        }

        return state;
    }

    drawer(state){
        this.setState(state);
        return super.drawer(state);
    }

    isInRange(i, j, n, m) {
        return i >= 0 && j >= 0 && i < n && i < m;
    }
    checkIfOpponentPiece(playerTurnObj, playerSetObj, destinationPointRow, destinationPointCol, state) {
        return ((playerTurnObj === this.turn.player1)
            ? playerSetObj.player2 : playerSetObj.player1)
            .has(state.grid[destinationPointRow][destinationPointCol])
    }

    turnSwitch(state){
        let newTurn;
        if ( state.playerState.playerTurn === this.turn.player1 ){
            return newTurn = this.turn.player2;
        } else {
            return newTurn = this.turn.player1;
        }
    }
    stateUpdate(state) {
        state.playerState.playerTurn = this.turnSwitch(state)
        console.log(state.playerState.playerTurn)
        console.log(state.playerState.playerPieces)
        state = {
            grid: state.grid,
            playerState: {
                // turn switch
                playerTurn: state.playerState.playerTurn,
                playerPieces: state.playerState.playerPieces
            }
        };
        // console.log(this.state.playerState.playerPieces)
        console.log(state.playerState.playerTurn)
    }
    DFS(visitedGrid, currentRow, currentCol, sourceRow, sourceCol, goalRow, goalCol, state){
        // visited
        visitedGrid[currentRow][currentCol] = true;
        console.log(state.playerState.playerPieces)

        let playerState = state.playerState;
        let isGoalPositionDetected = false;
        for (const [key, value] of this.pieceRule[ state.grid[sourceRow][sourceCol] ].entries()){
            let destinationPointRow = currentRow + key.move[0];
            let destinationPointCol = currentCol + key.move[1];
            if (  !this.isInRange(destinationPointRow, destinationPointCol, this.board.rows, this.board.cols) )continue;
            else if( visitedGrid[destinationPointRow][destinationPointCol] )continue;
            else if( key.skip ){
                // exists(above), empty and opponent in middle
                if(    state.grid[destinationPointRow][destinationPointCol] === null
                    && this.checkIfOpponentPiece(playerState.playerTurn, playerState.playerPieces, (destinationPointRow + currentRow) / 2, (destinationPointCol + currentCol) / 2, state) ){

                    if( destinationPointRow === goalRow && destinationPointCol === goalCol ){
                        isGoalPositionDetected ||= true;// update
                        if( isGoalPositionDetected ){
                            state.grid[ (destinationPointRow + currentRow)/2 ][ (destinationPointCol + currentCol)/2 ] = null;
                            return isGoalPositionDetected;
                        }
                    } else {
                        isGoalPositionDetected ||= this.DFS(visitedGrid, destinationPointRow, destinationPointCol, sourceRow, sourceCol, goalRow, goalCol, state);
                        if( isGoalPositionDetected ){
                            // remove intermediate
                            state.grid[ (destinationPointRow + currentRow)/2 ][ (destinationPointCol + currentCol)/2 ] = null;
                            return isGoalPositionDetected;
                        }
                    }

                }
            }
        }
        return isGoalPositionDetected;
    }


    render() {return super.render()}



    initializeGamePieces() {
        this.gamePieces = {
            BLACKMAN: 'black-man',
            BLACKKING: 'black-king',
            WHITEMAN: 'white-man',
            WHITEKING: 'white-king'
        };
    }

    initializePiecesRules() {
        // there is a difference between map and js object.
        // map >> [ <type A> ] = <type B>
        // Object >> constant value: <type A>
        let largeNumber = 100;
        this.pieceRule = new Map();
        this.pieceRule[ this.gamePieces.BLACKMAN ] = new Map();
        this.pieceRule[ this.gamePieces.BLACKMAN ].set({ move: [1, 1], skip: false }, 1);
        this.pieceRule[ this.gamePieces.BLACKMAN ].set({ move: [1, -1], skip: false }, 1);
        this.pieceRule[ this.gamePieces.BLACKMAN ].set({ move: [2, 2], skip: true }, largeNumber);
        this.pieceRule[ this.gamePieces.BLACKMAN ].set({ move: [2, -2], skip: true }, largeNumber);
        this.pieceRule[ this.gamePieces.WHITEMAN ] = new Map();
        this.pieceRule[ this.gamePieces.WHITEMAN ].set({ move: [-1, 1], skip: false }, 1);
        this.pieceRule[ this.gamePieces.WHITEMAN ].set({ move: [-1,-1], skip: false }, 1);
        this.pieceRule[ this.gamePieces.WHITEMAN ].set({ move: [-2, -2], skip: true }, largeNumber);
        this.pieceRule[ this.gamePieces.WHITEMAN ].set({ move: [-2, 2], skip: true }, largeNumber);
        this.pieceRule[ this.gamePieces.BLACKKING ] = new Map([...this.pieceRule[ this.gamePieces.BLACKMAN ],
            ...this.pieceRule[ this.gamePieces.WHITEMAN ]]);
        this.pieceRule[ this.gamePieces.WHITEKING ] = new Map( this.pieceRule[ this.gamePieces.BLACKKING ] );
    }

    initializeComponentState(chosenPieces) {

        this.setIsAlternating(true);
        this.board.baseColor = '#00ffff';
        this.board.alternatingColor = '#002260';
        this.setPieceScalar(0.7);
        this.board.cellMargin = 1;

        this.startState(chosenPieces);
    }
    startState(chosenPieces) {
        console.log(chosenPieces)
        let usedGrid = this.instantiateBoard(8, 8)
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 8; j++) {
                usedGrid[i][j] = ( ((i + j) % 2 === 1)? this.gamePieces.BLACKMAN : null );
            }
        }

        for (let i = 5; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                usedGrid[i][j] = ( ((i + j) % 2 === 1)? this.gamePieces.WHITEMAN : null );
            }
        }
        this.state = {
            grid: usedGrid,
            playerState: {
                playerTurn: (chosenPieces === "W"? this.turn.player1: this.turn.player2), // must be generic
                playerPieces: {
                    player1: new Set().add(this.gamePieces.WHITEMAN), // must be generic
                    player2: new Set().add(this.gamePieces.BLACKMAN)
                }
            }
        };
        this.initializeCellStyle();
        this.initializePiecesSource();
        return this.state;
    }

    getBackgroundColor(i, j){
        // must be updated in chess.
        if( !this.board.isAlternatingColor )
            return this.board.baseColor
        else
            return this.getAlternatingColIfNeeded(i,j)
    }

    initializeCellStyle(i,j){
        return  {
            backgroundColor: this.getBackgroundColor(i, j),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: (this.board.isCircular) ? 600 / this.board.cols : 0,
            border: 'solid',
            width: 600 / this.board.cols,
            height: 600 / this.board.cols,
        }
    }

    initializePiecesSource() {
        this.piecesSource[this.gamePieces.BLACKMAN] = <i className="fa fa-circle text-black " style=
            {{fontSize: this.board.pieceScalar * this.board.cellWidth}}></i>;
        this.piecesSource[this.gamePieces.BLACKKING] = <i className="fa fa-circle text-black " style=
            {{fontSize: this.board.pieceScalar * this.board.cellWidth}}></i>;
        this.piecesSource[this.gamePieces.WHITEMAN] = <i className="fa fa-circle text-white " style=
            {{fontSize: this.board.pieceScalar * this.board.cellWidth}}></i>;
        this.piecesSource[this.gamePieces.WHITEKING] = <i className="fa fa-circle text-white " style=
            {{fontSize: this.board.pieceScalar * this.board.cellWidth}}></i>;
    }

    getInput(input) {
        // invalid case
        if(input.length === 0)return null;

        // invalid case
        if(input.split(" ").length !== 4)return null;

        const [string1, string2, string3, string4] = input.split(" ");

        console.log(string1, string2, string3, string4)

        // invalid cases
        if( isNaN(string1) )return null;
        if( isNaN(string3) )return null;
        if( !(string2.length === 1 && 'a' <= string2.toLowerCase() && string2.toLowerCase() <= 'z') )return null;
        if( !(string4.length === 1 && 'a' <= string4.toLowerCase() && string4.toLowerCase() <= 'z') )return null;

        let b = string2.toLowerCase().charCodeAt(0) - 97;
        let a = Number(string1) - 1;

        let d = string4.toLowerCase().charCodeAt(0) - 97;
        let c = Number(string3) - 1;

        // invalid cases
        if( !(0 <= a && a <= 7) )return null;
        if( !(0 <= b && b <= 7) )return null;
        if( !(0 <= c && c <= 7) )return null;
        if( !(0 <= d && d <= 7) )return null;

        return [[a, b], [c, d]];
    }

}
export default Checkers;
