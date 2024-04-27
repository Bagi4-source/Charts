import {createChart} from 'lightweight-charts';
import {useCallback, useEffect, useRef, useState} from "react";
import {ITicker} from "./Sidebar";
import {Chip} from "@nextui-org/react";

interface IChart {
    height: number
    smaPeriod: number
    data: { [key: string]: IData[] }
    keys: ITicker[]
}

export interface IData {
    time: string
    value: number
}


const colors = [
    {r: 246, g: 94, b: 11},
    {r: 12, g: 176, b: 90},
    {r: 78, g: 45, b: 200},
    {r: 150, g: 210, b: 17},
    {r: 33, g: 89, b: 255},
    {r: 205, g: 40, b: 90},
    {r: 140, g: 18, b: 250},
    {r: 20, g: 165, b: 133},
    {r: 255, g: 70, b: 30},
    {r: 80, g: 190, b: 55},
    {r: 77, g: 90, b: 210},
    {r: 221, g: 34, b: 143},
    {r: 10, g: 120, b: 245},
    {r: 190, g: 60, b: 22},
    {r: 38, g: 215, b: 140},
    {r: 160, g: 30, b: 255},
    {r: 50, g: 175, b: 75},
    {r: 101, g: 85, b: 210},
    {r: 235, g: 15, b: 60},
    {r: 70, g: 195, b: 32},
    {r: 255, g: 120, b: 10},
    {r: 120, g: 160, b: 245},
    {r: 195, g: 80, b: 180},
    {r: 17, g: 135, b: 225},
    {r: 212, g: 55, b: 105},
    {r: 60, g: 100, b: 235},
    {r: 173, g: 10, b: 100},
    {r: 25, g: 200, b: 50},
    {r: 255, g: 50, b: 80},
    {r: 90, g: 145, b: 255},
    {r: 140, g: 75, b: 220},
    {r: 47, g: 160, b: 15},
    {r: 255, g: 90, b: 40},
    {r: 110, g: 185, b: 75},
    {r: 180, g: 45, b: 220},
    {r: 10, g: 145, b: 120},
    {r: 240, g: 20, b: 185},
    {r: 64, g: 180, b: 22},
    {r: 130, g: 20, b: 255},
    {r: 60, g: 160, b: 90},
    {r: 200, g: 95, b: 180},
    {r: 20, g: 155, b: 225},
    {r: 250, g: 60, b: 55},
    {r: 100, g: 200, b: 30},
    {r: 255, g: 25, b: 120},
    {r: 150, g: 150, b: 255},
    {r: 220, g: 105, b: 70}
];
const Chart = ({data, smaPeriod, height}: { data: IData[], smaPeriod: number, height: number }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const calculateSMA = useCallback((data: IData[]) => {
        const avg = function (part: IData[]) {
            let sum = 0;
            for (let i = 0; i < part.length; i++) {
                sum += part[i].value;
            }
            return sum / part.length;
        };
        const result = new Array<IData>();
        for (let i = smaPeriod - 1, len = data.length; i < len; i++) {
            const val = avg(data.slice(i - smaPeriod + 1, i));
            result.push({time: data[i - Math.ceil((smaPeriod - 1) / 2)].time, value: val});
        }
        return result;
    }, [smaPeriod])

    useEffect(() => {
        if (!chartContainerRef.current) return;
        const chart = createChart(chartContainerRef.current, {
            layout: {
                textColor: 'black',
                background: {
                    color: 'white'
                }
            },
            rightPriceScale: {
                borderVisible: false,
            },
            timeScale: {
                borderVisible: false,
            },
            grid: {
                horzLines: {
                    color: '#eee',
                },
                vertLines: {
                    color: '#eee',
                },
            },
            height: height
        });
        const {r, g, b} = {r: 246, g: 94, b: 11};
        const areaSeries = chart.addLineSeries({
            color: `rgb(${r},${g},${b})`,
        });
        areaSeries.setData(data);

        const smaLine = chart.addLineSeries({
            color: '#295bff',
            lineWidth: 3,
            lastValueVisible: false,
            priceLineVisible: false
        });
        const smaData = calculateSMA(data);
        smaLine.setData(smaData);
        chart.timeScale().fitContent();
        const handleResize = () => {
            chart.applyOptions({width: chartContainerRef.current?.clientWidth});
        };

        chart.timeScale().fitContent();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);

            chart.remove();
        };
    }, [calculateSMA, data, height]);
    return (<div ref={chartContainerRef} className={"col-span-3 relative"}>
    </div>)
}

export const SeriesChart = ({smaPeriod, data, keys, height}: IChart) => {
    const [selectedKey, setKey] = useState<ITicker>({
        id: -1,
        name: ""
    });

    useEffect(() => {
        if (keys.length > 0) {
            setKey(keys[0]);
        }
    }, [keys]);

    return <div className={"flex flex-col gap-2 mb-4"}>
        <div className={"text-2xl"}>
            График отдельного тикера
        </div>
        <div>
            <Chart data={data[selectedKey.name] ?? []} smaPeriod={smaPeriod} height={height}/>
        </div>
        <div className={"flex gap-2 flex-wrap"}>
            {keys.map((key, index) =>
                <Chip
                    onClick={() => setKey(key)}
                    className={`hover:opacity-80 cursor-pointer ${(selectedKey === key) ? "bg-primary text-white" : ""}`}
                    key={index}>{key.name}</Chip>
            )}
        </div>
    </div>
}