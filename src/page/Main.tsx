import {ITicker, Sidebar} from "../widgets/Sidebar";
import {Chart, IData} from "../widgets/Chart";
import React, {useEffect, useState} from "react";

export const Main = () => {
    const [smaPeriod, setSmaPeriod] = useState<number>(10)
    const [data, setData] = useState<{ [key: string]: IData[] }>({})
    const [groups, setGroups] = useState<{ [key: number]: ITicker[] }>({});

    return (<div className={"container mx-auto"}>
        <h1 className={"text-3xl my-8"}>МЕГА анализатор</h1>
        <div className={"grid grid-cols-2 md:grid-cols-4 gap-4 w-full h-full"}>
            <Sidebar
                smaPeriod={smaPeriod}
                onChangeData={(data) => {
                    setData(data);
                }}
                onChangeSelection={setGroups}
                onChangeSMA={(smaPeriod) => {
                    setSmaPeriod(smaPeriod);
                }}/>
            <Chart
                groups={groups}
                data={data}
                smaPeriod={smaPeriod}
                height={500}/>
        </div>
    </div>)
}