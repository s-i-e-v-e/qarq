/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Dictionary} from "./mod.ts";

const DICT = "<dict>";
const DICT_E = "</dict>";
const KEY = "<key>";
const KEY_E = "</key>";

const STRING = "<string>";
const STRING_E = "</string>";
const INTEGER = "<integer>";
const INTEGER_E = "</integer>";
const REAL = "<real>";
const REAL_E = "</real>";
const ARRAY = "<array>";
const ARRAY_E = "</array>";

const FALSE = "<false />";
const TRUE = "<true />";

class PX {
    constructor(public xml: string) {
        this.xml = xml;
    }
}

function parseTrue(px: PX) {
    px.xml = px.xml.substring(TRUE.length);
    return true;
}

function parseFalse(px: PX) {
    px.xml = px.xml.substring(FALSE.length);
    return false;
}

function parseArray(px: PX) {
    const a = ARRAY.length;
    const b = px.xml.indexOf(ARRAY_E);
    const x = px.xml.substring(a, b);
    if (x.length) throw new Error(px.xml);
    px.xml = px.xml.substring(b + ARRAY_E.length);
    return [];
}

function parseReal(px: PX) {
    const a = REAL.length;
    const b = px.xml.indexOf(REAL_E);
    const x = px.xml.substring(a, b);
    px.xml = px.xml.substring(b + REAL_E.length);
    return x;
}

function parseInteger(px: PX) {
    const a = INTEGER.length;
    const b = px.xml.indexOf(INTEGER_E);
    const x = px.xml.substring(a, b);
    px.xml = px.xml.substring(b + INTEGER_E.length);
    return x;
}

function parseString(px: PX) {
    const a = STRING.length;
    const b = px.xml.indexOf(STRING_E);
    const x = px.xml.substring(a, b);
    px.xml = px.xml.substring(b + STRING_E.length);
    return x;
}

function parseValue(px: PX) {
    if (px.xml.startsWith(STRING)) {
        return parseString(px);
    }
    else if (px.xml.startsWith(INTEGER)) {
        return parseInteger(px);
    }
    else if (px.xml.startsWith(REAL)) {
        return parseReal(px);
    }
    else if (px.xml.startsWith(ARRAY)) {
        return parseArray(px);
    }
    else if (px.xml.startsWith(DICT)) {
        return parseDict(px);
    }
    else if (px.xml.startsWith(FALSE)) {
        return parseFalse(px);
    }
    else if (px.xml.startsWith(TRUE)) {
        return parseTrue(px);
    }
    else {
        throw new Error(px.xml);
    }
}

function parseKey(px: PX) {
    const a = KEY.length;
    const b = px.xml.indexOf(KEY_E);
    const x = px.xml.substring(a, b);
    px.xml = px.xml.substring(b + KEY_E.length);
    return x;
}

function parseDict(px: PX) {
    px.xml = px.xml.substring(DICT.length);
    const o: Dictionary<any> = {};
    while (true) {
        if (px.xml.startsWith(DICT_E)) {
            px.xml = px.xml.substring(DICT_E.length);
            break;
        }
        else if (px.xml.startsWith(DICT)) {
            o.dict = parseDict(px);
        }
        else if (px.xml.startsWith(KEY)) {
            const k = parseKey(px);
            o[k] = parseValue(px);
        }
        else {
            throw new Error(px.xml);
        }
    }
    return o;
}

function parseXml(px: PX) {
    if (px.xml.startsWith(DICT)) {
        return parseDict(px);
    }
    else {
        throw new Error(px.xml);
    }
}

export default class PlistParser {
    static format(xml: string) {
        xml = xml.replace(/(?:\r\n|\r|\n)\s*/g, "");
        xml = xml.replaceAll(/<plist version="1.0">/gi, "<plist>");
        xml = xml.replaceAll(/<plist>/gi, "");
        xml = xml.replaceAll(/<\/plist>/gi, "");
        return xml;
    }

    static parse(xml: string) {
        xml = PlistParser.format(xml);
        const p = parseXml(new PX(xml));
        const o: Dictionary<any> = {};
        Object.entries(p).forEach(kv => o[kv[0]] = kv[1]);
        return o;
    }
}