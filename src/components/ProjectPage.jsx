import React, { useRef, useState, useEffect } from 'react'
import '../styles/Projectpage.css'

export default function ProjectPage() {

    const canva = useRef(null)
    const AddOutput = useRef(null);
    const [whichOut, setWhichOut] = useState(false)
    const [startAddVtx, stopAddVtx] = useState(false)
    const [Vertix_data, updateWord] = useState("Add Vertex")
    const [startVal, setStartVal] = useState("")

    const [addedge, setaddedge] = useState(false)
    const [edges, setedges] = useState([]);
    const [selectedVertix, setSelectedVertix] = useState([]) 

    const [circleArray, setCircleArray] = useState([])
    const [Adjlist, setAdjList] = useState({})

    function Circle(id, x, y, radius, color) {
        this.color = color
        this.id = id
        this.x = x
        this.y = y
        this.radius = radius

        this.draw = (ptr) => {
            ptr.beginPath();
            ptr.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ptr.fillStyle = this.color
            ptr.fill()
            ptr.stroke()

            ptr.fillStyle = "white";
            ptr.font = "20px Arial";
            ptr.textAlign = "center";
            ptr.textBaseline = "middle";
            ptr.fillText(this.id, this.x, this.y);
        }
    }

    function ConnectLine(startCircle, endCircle) {
        this.start = startCircle;
        this.end = endCircle;

        this.draw = (ptr) => {
            ptr.beginPath();
            ptr.moveTo(this.start.x, this.start.y);
            ptr.lineTo(this.end.x, this.end.y);
            ptr.stroke();
        };
    }

    const DrawCanvas = () => {
        const cnva = canva.current
        const ptr = cnva.getContext("2d")

        cnva.width = cnva.getBoundingClientRect().width;
        cnva.height = cnva.getBoundingClientRect().height;

        // Clear Cnava
        ptr.clearRect(0, 0, cnva.width, cnva.height);

        edges.forEach(edge => edge.draw(ptr));
        // let i = 0;
        circleArray.forEach(circle => circle.draw(ptr));
    }

    const getCircle = (e) => {
        const cnva = canva.current;
        const rect = cnva.getBoundingClientRect();

        const xpos = e.clientX - rect.left;
        const ypos = e.clientY - rect.top;

        if (addedge) {
            const clickedCircle = circleArray.find((circle) => {
                let cx = xpos - circle.x;
                let cy = ypos - circle.y;
                return Math.sqrt(cx * cx + cy * cy) <= circle.radius;
            });

            if (clickedCircle) {
                const selection = [...selectedVertix, clickedCircle];
                setSelectedVertix(selection)

                if (selection.length === 2) { 
                    const newline = new ConnectLine(selection[0], selection[1]);
                    const Newedge = [...edges, newline]
                    setedges(Newedge);
                    setSelectedVertix([]);


                    // Add Element to Adjlist
                    let a = selection[0].id
                    let b = selection[1].id

                    function adjlistadd(prev, a, b) {
                        const updatedAdjlist = {...prev}
                        if(!updatedAdjlist[a]) updatedAdjlist[a] = []
                        if(!updatedAdjlist[b]) updatedAdjlist[b] = []
                        updatedAdjlist[a].push(b) 
                        updatedAdjlist[b].push(a)
                        return updatedAdjlist;
                    }
                    setAdjList(prev => adjlistadd(prev, a, b))
                }
            }
        } else if (startAddVtx) {
            //This is the value of Nodes
            let id = circleArray.length
            let color = "black"
            let circle = new Circle(id, xpos, ypos, 25, color)
            const newCircle = [...circleArray, circle]
            setCircleArray(newCircle)
        }
    }

    //redraw state when updates is hapenning on rerender
    useEffect(() => {
        DrawCanvas();
    }, [circleArray, edges]);

    const Make_Vertex = () => {
        if (addedge === true) {
            setaddedge(!addedge);
        }

        if (startAddVtx === true) {
            updateWord("Add Vertex")
        } else {
            updateWord("Stop Adding")
        }
        stopAddVtx(!startAddVtx);
    }

    const Add_edge = () => {
        if (startAddVtx === false && addedge === false || addedge === true && startAddVtx === false) {
            setaddedge(!addedge);
            return;
        }

        if (startAddVtx === true && addedge === false) {
            stopAddVtx(!startAddVtx);
            setaddedge(!addedge);
            updateWord("Add Vertex");
        } else {
            stopAddVtx(!startAddVtx);
            updateWord("Stop Adding");
        }
    }


    const clearTheCanva = () => {
        setaddedge(false)
        stopAddVtx(false);
        setCircleArray([])
        setedges([])
        setWhichOut(false)
        AddOutput.current.innerHTML = "";
        const cnva = canva.current;
        let ptr = cnva.getContext("2d");
        ptr.clearRect(0, 0, cnva.width, cnva.height);
    };


    const DFS = (key)=>{
        setWhichOut(true)
        stopAddVtx(false)
        setaddedge(false)

        if (circleArray.length === 0) {
            alert("Please Add Nodes First!!!")
            return
        }

        let visited = new Array(circleArray.length).fill(false);
        let result = []
      

        // Reject No need 
        const delay = (ms) => new Promise((resolve, reject)=>{
            setTimeout(() => {
                resolve ()
            }, ms);
        });

        // Set Heading of Algorithm
        AddOutput.current.innerHTML += `<br><br><span style="font-size: large; font-weight: bold; margin: 12px;" > DFS  :  </span>`;

        // Main DFS code
        const DFSCode = async (node) =>{
            visited[node] = true;
            result.push(node)

           for (let i = 0; i < circleArray.length; i++) {
            if (parseInt(circleArray[i].id) == node) {
                circleArray[i].color = "green"
                setCircleArray([...circleArray])
                DrawCanvas()
                await delay(1000)
                

                // Adding Output in Operation Box
                if (AddOutput.current) {
                    AddOutput.current.innerHTML += `<span style="font-weight: bold; font-size: large; margin: 12px;">${node}</span>`;
                }

                circleArray[i].color = "black"
                setCircleArray([...circleArray])
                DrawCanvas()
                break;
            }
            
           }

            for (const element of (Adjlist[node] || [])) {
                if(!visited[element]) {
                    await DFSCode(element)
                }
            }
        }

        DFSCode(parseInt(key))
        console.log(result)
        setWhichOut(false)
    }

    return (
        <div className="container">

            <canvas ref={canva} onClick={getCircle} className="canvas" style={{ border: "1px solid #000000" }} />

            <div className="display-panel">
                <div className="top-panel">
                    <h1>Operations</h1>
                    <h1>
                        Mode: <span className="mode-name">{  addedge ? "Add Edge" : startAddVtx ? "Add Vertex" : "Pointer"}</span>
                    </h1>
                </div>
                <div ref={AddOutput} className="operations"> {whichOut ? "DFS : " : ""}</div>
            </div>

            <div className="controls">
                <h2>Controls</h2>

                <div className="right">
                    <form>
                        <label><b>Starting Node</b></label>
                        <input type="number" className="start-node" onChange={(e)=>{setStartVal(e.target.value)}} value={startVal} />
                    </form>
                </div>

                <div className="left">
                    <button onClick={Make_Vertex} className="vertexButton" data-clicked="false">{Vertix_data}</button>
                    <button onClick={Add_edge} className="edgeButton" data-clicked="false">{!addedge ? "Add Edge" : "Stop Edge"}</button>
                    <button className="bfsButton">BFS</button>
                    <button onClick={()=> startVal === "" ? alert("Please Enter The Start key!!") : DFS(startVal)} className="dfsButton">DFS</button>
                    <button onClick={clearTheCanva} className="clearCanvas">Clear Canvas</button>
                </div>

            </div>
        </div>
    )
}
