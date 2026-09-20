import { validate as isValidUUID } from 'uuid'

/* In order to store multiple targets in a single hunter row, we use a "quick and dirty" approach of 
combining their UIDs in a comma-separated string, rather than resorting to an entire new table.
This file contains translation methods that go back and forth between a JS list of strings: [String, ..., String]
and our custom format:  "String,...,String"*/
export function targetListFromString(targetListString) {
    if (!targetListString || targetListString === "") return [];

    let ret = [];
    let entries = targetListString.split(",");
    for (let entry of entries) {
        if (isValidUUID(entry)) ret.push(entry)
    }
    return ret
}

/* Takes a list of app_uid strings, and creates a comma-seperated version representing it to store in the database*/
export function stringFromTargetList(targetList) {
    let string = targetList.reduce(
        (accumulator, currentValue) => {
            if (accumulator == "") {
                // For the first item, don't prepend comma
                return `${currentValue}`
            } else {
                return accumulator + "," + `${currentValue}`
            }
        }, ""
    )
    return string
}