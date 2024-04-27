import {ITicker, Sidebar} from "../widgets/Sidebar";
import {CandleChart, IData} from "../widgets/CandleChart";
import React, {useState} from "react";
import {SeriesChart} from "../widgets/SeriesChart";
import {DateValue, RangeValue} from "@nextui-org/react";
import {parseAbsoluteToLocal} from "@internationalized/date";

export const Main = () => {
    const [smaPeriod, setSmaPeriod] = useState<number>(10)
    const [data, setData] = useState<{ [key: string]: IData[] }>({})
    const [groups, setGroups] = useState<{ [key: number]: ITicker[] }>({});
    const [groupNames, setGroupNames] = useState<{ [key: number]: string }>({});
    const [keys, setKeys] = useState<ITicker[]>([]);
    const [dateRange, setDateRange] = useState<RangeValue<DateValue>>({
        start: parseAbsoluteToLocal(new Date().toISOString()),
        end: parseAbsoluteToLocal(new Date().toISOString())
    });

    return (<div className={"container mx-auto"}>
        <h1 className={"text-3xl my-8"}>МЕГА анализатор</h1>
        <div className={"grid grid-cols-2 md:grid-cols-4 gap-4 w-full h-full"}>
            <Sidebar
                dateRange={dateRange}
                onDatesChange={setDateRange}
                onSetKeys={setKeys}
                smaPeriod={smaPeriod}
                onChangeData={setData}
                onChangeSelection={setGroups}
                onSetGroupNames={setGroupNames}
                onChangeSMA={setSmaPeriod}/>
            <div className={"col-span-3 mb-16"}>
                <SeriesChart height={400} smaPeriod={smaPeriod} data={data} keys={keys}/>
                <CandleChart
                    dateRange={dateRange}
                    groupNames={groupNames}
                    groups={groups}
                    data={data}
                    smaPeriod={smaPeriod}
                    height={400}/>
            </div>
        </div>
    </div>)
}