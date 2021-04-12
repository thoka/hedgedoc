'use strict'

const hyphenopoly = require('hyphenopoly')

const hyphenator = hyphenopoly.config({
    "require": ["de", "en-us"],
    "hyphen": ".",
    "exceptions": {
        "en-us": "en-han-ces"
    }
})

const USE_MEGAHASH = false
var data, dataSet, dataGet


if (USE_MEGAHASH) {
    const MegaHash = require('megahash')
    data = new MegaHash() 
    dataSet = (key,value) => data.set(key,value)
    dataGet = (key) => data.get(key)
} else {
    data = {}
    dataSet = (key,value) => data[key] = value
    dataGet = (key) => data[key]
}

const rSylSplit = /[.\-<>=·]+/g

function addLine(l) {
    const b = l.replace(rSylSplit,'')
    dataSet(b,l)
}

const fs = require('fs')
const readline = require('readline')
const logger = require('../logger')
const { historyPost } = require('../history')

var hyphenateText

function init() {
    const rl = readline.createInterface({
        input: fs.createReadStream('lib/hyphenize/wordlist.de.txt'),
        output: process.stdout,
        terminal: false
    })

    rl.on('line', addLine )
    rl.on('close', start )
}

const pendingRequests = []
let started = false

async function start() {
    hyphenateText = await hyphenator.get("de")
    logger.info("hyphenizer initialized ...")
    started = true
    while (pendingRequests.length) {
        let [req,cb] = pendingRequests.pop()
        hyphenize(req,cb)
    } 
} 

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function capitalizeFirstLetterOnly(string) {
    return string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
}

function hyphenizeWord(w,keep=false,checkDelim=true) {    
    let res = dataGet(w)
    if (res) return res.replace(rSylSplit,'.')    
    if (checkDelim && w.search(rSylSplit) > 0) {
        return w.split(rSylSplit).map( (w) => hyphenizeWord(w,true,false)).join('-.')
    }
    res = dataGet(capitalizeFirstLetter(w))
    if (res) return res.replace(rSylSplit,'.')      
    res = dataGet(capitalizeFirstLetterOnly(w))
    if (res) return res.replace(rSylSplit,'.')     
    res = dataGet(w.toLowerCase())    
    if (res) return res.replace(rSylSplit,'.')   

        
    return hyphenateText(w).split('.').map(splitFurther).join('.').replace(/[.]+([^aeiouäöüy])[.]/g,'$1.') 

    // TODO: search for composita
    /* this is to naive and has complexity n! 
    for (let i = 4;i<w.length;i++) {
        var a,b
        if (a = hyphenizeWord(w.substr(0,i),false,false)) {
            if ( b = hyphenizeWord(w.slice(i),false,false) ) return `${a}.${b}`  
            if ( w.charAt(i) == 's' && (b=hyphenizeWord(w.slice(i+1),false,false)) ) return `${a}s.${b}`   
        }
    } */      
}

function isV(c) {
    return c.match(/[aeiouöäüyéè]/i)
}

const splitExceptions = {
    'afri' : 1, 'afro' : 1, 'akro':1, 'ideen':3, 'etho':2, 'ethik':1, 'ethi': 1, 'ethos':1,
    'ethyl' : 1, 'ethy': 1, 'tivaf':3 , 'sien':2, 'gien':2, 'ephe':1
}

function splitFurther(s) {
    const hasTwoSyllables = /[aeiouöäüyéè][^aeiouöäüyéè]+[aeiouöäüyéè]|[^q]ua|io|iö|ia|[^q]ue|[^q]ui|eo|ee|eie|ao|ea|iä|ae|[^q]uo|^sien$|^gien$/i 
    const skip=/^(shire|creme|coun|gate|team|nage|veau|ware|ville|veaus|trouil)$/   
    var f,i
    
    if ( ( f = s.search(hasTwoSyllables)) < 0 ) return s
    if ( s.match(skip)) return s
    const t = s.toLowerCase()
    i = splitExceptions[t]
    if ( i ) return splitFurther(s.slice(0,i))+'.'+s.slice(i) 
 
    i = s.length-1
    var b 
    // find last vocal
    while ( i>0 && !isV(b=s.charAt(i)))  i--
    let a = s.charAt(i-1)
    // vocal exceptions
    if (b=='u' && (a=='a' || a =='e' ) ) { // au / eu
       i--              
    } else if (b=='e') {
       if ( (a=='i' && (s.charAt(i-2)!='e' && s.charAt(i-2)!='l' )) /* eie*/ 
         || (a=='e') /* ee */ )  i-- 
       else if  (a=='u' && (s.charAt(i-2)=='q' || s.charAt(i-2)=='Q'))  i -= 2
    } else if (b=='i' && (a=='e' || a == 'o' ) ) { i-- // ei, oi
    } else if ( (b=='a' || b=='o' || b=='i') && a =='u' && (s.charAt(i-2)=='q' || s.charAt(i-2)=='Q') ) /*qua*/ {
       i -= 2 
    }  
    
    a = s.charAt(i-1) 
    if (!isV(a) && a!='ß') {
        i--;  b = a; a = s.charAt(i-1)
        // consonant exceptions
        if ( b=='h'  &&  a=='c') {
            i--;
            if (s.charAt(i-1)=='s') i--;      
        } else if ( b=='r'  &&  a=='d') {
            i--;
        } else if (b=='k' && a=='c') {
            i--;  
        } /* else if (b=='r' && a=='e') { //er
            i++;
        } */
    }
    var res
    if (i==0) res=s
    else res=splitFurther(s.slice(0,i))+'.'+s.slice(i)
    return res
}




function hyphenize(req, cb) {

    if (!started) {
        pendingRequests.push( [req,cb] )
        return;
    } 
    const res = []
    for (let w of req) {
        res.push( [w, hyphenizeWord(w) ] ) 
    }
    cb(res)
}




init()

module.exports = hyphenize


