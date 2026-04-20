import { FileText, Clock3, CircleCheckBig, CircleX } from "lucide-react"

export default function Dashboard() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            
            <div className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
                <div className="flex flex-col px-3 text-center">
                    <span>Total</span>
                    <span className="text-xl font-bold">0</span>
                </div>
                <FileText />
            </div>

            <div className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
                <div className="flex flex-col px-3 text-center">
                    <span>A Vencer</span>
                    <span className="text-xl font-bold text-yellow">0</span>
                </div>
                <Clock3 color="var(--color-yellow)"/>
            </div>

            <div className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
                <div className="flex flex-col px-3 text-center">
                    <span>Ativas</span>
                    <span className="text-xl font-bold text-green">0</span>
                </div>
                <CircleCheckBig color="var(--color-green)"/>
            </div>

            <div className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
                <div className="flex flex-col px-3 text-center">
                    <span>Vencidas</span>
                    <span className="text-xl font-bold text-red">0</span>
                </div>
                <CircleX color="var(--color-red)"/>
            </div>

        </div>
    )
}