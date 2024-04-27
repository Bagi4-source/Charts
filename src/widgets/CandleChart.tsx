import {createChart} from 'lightweight-charts';
import {useCallback, useEffect, useMemo, useRef} from "react";
import {ITicker} from "./Sidebar";
import {Chip, DateValue, RangeValue} from "@nextui-org/react";

interface IChart {
    height: number
    smaPeriod: number
    data: { [key: string]: IData[] }
    groups: { [key: string]: ITicker[] }
    groupNames: { [key: string]: string}
    dateRange: RangeValue<DateValue>
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

export const CandleChart = ({height, smaPeriod, data, groups, groupNames, dateRange}: IChart) => {
    const dateValueConvertToDate = (dateValue: DateValue) => new Date(dateValue.year, dateValue.month - 1, dateValue.day);
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

    const calculateDispersion = useCallback((data: IData[], smaData: IData[]) => {
        const result = new Array<IData>();
        let index = 0;
        smaData.forEach(({time, value}) => {
            while (index < data.length && data[index].time < time) {
                index++;
            }
            result.push({
                time,
                value: Math.pow(value - data[index].value, 2)
            })
        })
        return result;
    }, []);

    const dateRangeTimestamp = useMemo<[number, number]>(() => {
        return [dateValueConvertToDate(dateRange.start).valueOf(), dateValueConvertToDate(dateRange.end).valueOf()]
    }, [dateRange])

    const targetData = useMemo<{[key: string]: IData[]}>(() => {
        const [start, end] = dateRangeTimestamp;
        const result = Object.entries(data).map(([key, value]) => {
            const newData = value.filter((item) => {
                const keyDate = new Date(item.time).valueOf();
                return (keyDate >= start && keyDate <= end);
            });
            return [key, newData];
        })
        return Object.fromEntries(result);
    }, [data, dateRangeTimestamp])

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
                visible: false
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
        const candleSeries = chart.addCandlestickSeries({});
        const chartData = [];
        let i = 0;
        for (const [group, tickers] of Object.entries(groups)) {
            const day = (i + 1).toString().padStart(2, "0");
            const values = tickers.map(({name}) => {
                return targetData[name];
            });
            console.log(values)
            const color = colors[i] ?? {
                r: Math.ceil(Math.random() * 255),
                g: Math.ceil(Math.random() * 255),
                b: Math.ceil(Math.random() * 255),
            };
            i++;
            const {r, g, b} = color;
            if (values.length === 0 || values[0].length === 0) continue;
            let min = values[0][0].value;
            let max = values[0][0].value;
            let sum = 0;
            let count = 0;
            values.forEach(item => {
                item.forEach(({value}) => {
                    min = Math.min(value, min);
                    max = Math.max(value, max);
                    sum += value;
                    count++;
                })
            });
            const avg = sum / count;
            chartData.push({
                low: min,
                close: avg * 1.01,
                open: avg * 0.99,
                high: max,
                time: `2000-01-${day}`,
                color: `rgb(${r},${g},${b})`,
            })
        }
        candleSeries.setData(chartData);

        const handleResize = () => {
            chart.applyOptions({width: chartContainerRef.current?.clientWidth});
        };

        chart.timeScale().fitContent();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);

            chart.remove();
        };
    }, [calculateSMA, height, targetData, groups, calculateDispersion]);

    return (
        <div className={"flex flex-col gap-2"}>
            <div className={"text-2xl"}>
                График по группам
            </div>
            <div ref={chartContainerRef} className={"relative"}>
            </div>
            <div className={"flex gap-2"}>
                {Object.entries(groups).map(([key, value], index) => {
                    const color = colors[index] ?? {
                        r: Math.ceil(Math.random() * 255),
                        g: Math.ceil(Math.random() * 255),
                        b: Math.ceil(Math.random() * 255),
                    };
                    const {r, g, b} = color;
                    return <Chip key={index}
                                 className={"text-white"}
                                 style={{backgroundColor: `rgb(${r},${g},${b})`}}>{groupNames[key]}</Chip>
                })}
            </div>
        </div>
    )
}