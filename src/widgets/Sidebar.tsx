import {Button, Chip, Select, SelectItem} from "@nextui-org/react";
import {useCallback, useMemo, useState} from "react";
import {useDropzone} from "react-dropzone";
import {read, utils} from 'xlsx';
import {IData} from "./Chart";
import {Key} from "@react-types/shared";


export interface ITicker {
    id: number
    name: string
}

export interface IProps {
    onChangeSMA: (smaPeriod: number) => void
    onChangeData: (data: { [key: string]: IData[] }) => void
    onChangeSelection: React.Dispatch<React.SetStateAction<{ [p: number]: ITicker[] }>>
    smaPeriod: number
}

const GroupSelector = ({data, items, group, onChangeSelection}: {
    items: ITicker[],
    group: number,
    data: { [key: string]: IData[] },
    onChangeSelection: (key: number, value: ITicker[]) => void
}) => {
    const [selection, setSelection] = useState<"all" | Iterable<Key> | undefined>();
    const [selectedItems, setSelectedItems] = useState<ITicker[]>([]);
    const stats = useMemo(() => {
        const chartData = selectedItems.map(({name}) => {
            return data[name];
        });
        const values: { [key: string]: { sum: number, count: number } } = {}
        chartData.forEach(item => {
            item.forEach(({value, time}) => {
                values[time] = {
                    count: (values[time]?.count ?? 0) + 1,
                    sum: (values[time]?.sum ?? 0) + value,
                }
            })
        });
        let disp = 0;
        let count = 0;
        let sum = 0;
        let min = Infinity;
        let max = 0;
        chartData.forEach(item => {
            item.forEach(({value, time}) => {
                const avg = values[time].sum / values[time].count;
                disp += Math.pow(value - avg, 2);
                sum += value;
                min = Math.min(min, value);
                max = Math.max(max, value);
                count++;
            })
        });
        if (count === 0) return {
            disp: 0,
            min,
            max,
            avg: 0,
        };
        return {
            disp: Math.sqrt(disp / count),
            min,
            max,
            avg: sum / count,
        };
    }, [selection])
    return <div>
        <Select
            aria-label={"ticker-select"}
            items={items}
            variant="bordered"
            isMultiline={true}
            selectionMode="multiple"
            placeholder="Выберите тикеры"
            labelPlacement="outside"
            classNames={{
                base: "max-w-xs",
                trigger: "min-h-unit-12 py-2",
            }}
            selectedKeys={selection}
            onSelectionChange={(data) => {
                const selection = Array.from(data);
                setSelection(data);
                const selectedTickers = selection.map((index) => items[parseInt(index + "")]);
                setSelectedItems(selectedTickers);
                onChangeSelection(group, selectedTickers);
            }}
            renderValue={(items) => {
                return (
                    <div className="flex flex-wrap gap-2">
                        {items.map((item) => (
                            <Chip key={item.key}>{item.data?.name}</Chip>
                        ))}
                    </div>
                );
            }}
        >
            {(ticker) => (
                <SelectItem key={ticker.id} textValue={ticker.name}>
                    <div className="flex gap-2 items-center">
                        <div className="flex flex-col">
                            <span className="text-small">{ticker.name}</span>
                        </div>
                    </div>
                </SelectItem>
            )}
        </Select>
        {
            selectedItems.length > 0 &&
            <>
                <div>
                    Мин: {stats.min.toFixed(2)}
                </div>
                <div>
                    Макс: {stats.max.toFixed(2)}
                </div>
                <div>
                    Среднее: {stats.avg.toFixed(2)}
                </div>
                <div>
                    Дисперсия: {stats.disp.toFixed(2)}
                </div>
            </>
        }
    </div>
}

export const Sidebar = ({onChangeSMA, smaPeriod, onChangeData, onChangeSelection}: IProps) => {
    const [data, setData] = useState<{ [key: string]: IData[] }>({})
    const [keys, setKeys] = useState<ITicker[]>([]);
    const [groups, setGroups] = useState<number[]>([0]);
    const [groupCounts, setGroupCounts] = useState<number>(0);
    const [filename, setFilename] = useState<string>("");
    const [fileError, setFileError] = useState<string>("");
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;
        if (file.type !== "text/csv") return setFileError("Загрузите .csv файл");
        setFileError("");
        const wb = read(await file.arrayBuffer(), {cellNF: true});
        const data = utils.sheet_to_json(wb.Sheets['Sheet1'], {header: 1});
        const row = data[0] as string[];
        const keys = row.slice(1, row.length);
        const tickers = keys.map((item, index) => ({
            id: index,
            name: item
        }));
        setKeys(
            tickers
        );
        const entries = keys.map(() => new Array<string[]>());
        data.slice(1, data.length).forEach((item) => {
            const row = item as string[];
            const t = new Date(row[0]).toISOString().split('T')[0];
            row.slice(1, row.length)
                .forEach((value, index) => {
                    entries[index].push([t, value.toString()]);
                });
        });
        const result: { [key: string]: IData[] } = {};
        entries.forEach((values, index) => {
            result[keys[index]] = values.map(([key, value]) => ({
                time: key,
                value: parseFloat(value)
            }));
        })
        onChangeData(result);
        setData(result);
        setFilename(file.name);
    }, [onChangeData, onChangeSelection])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});
    const isFileError = useMemo(() => fileError !== "", [fileError]);

    return (<div className={"col-span-1 flex flex-col gap-4"}>
        <div {...getRootProps()}
             className={`h-20 w-full flex items-center justify-center text-center align-middle border-2 cursor-pointer ${isFileError ? "border-red-300" : "border-gray-300"} rounded-xl border-dashed`}>
            <input {...getInputProps()} />
            {
                isDragActive ?
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M16.44 8.90002C20.04 9.21002 21.51 11.06 21.51 15.11V15.24C21.51 19.71 19.72 21.5 15.25 21.5H8.73998C4.26998 21.5 2.47998 19.71 2.47998 15.24V15.11C2.47998 11.09 3.92998 9.24002 7.46998 8.91002"
                            stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 2V14.88" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round"
                              strokeLinejoin="round"/>
                        <path d="M15.35 12.65L12 16L8.65002 12.65" stroke="#292D32" strokeWidth="1.5"
                              strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    :
                    <p>{filename === "" ? isFileError ? fileError : "Переместите .csv файл сюда или кликните на текст" : filename}</p>
            }
        </div>

        {groups.map((group) => {
            return <GroupSelector data={data} group={group} items={keys} onChangeSelection={(key, value) => {
                onChangeSelection(prevState => ({
                    ...prevState,
                    [key]: value
                }));
            }}/>
        })}

        <Button color={"primary"} onClick={() => {
            const count = groupCounts + 1;
            setGroupCounts(count);
            setGroups(prevState => [...prevState, count]);
        }}>Добавить
            группу</Button>
    </div>)
}