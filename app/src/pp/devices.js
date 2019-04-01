import {decryptWithRsaPrivateKey} from '../utils/crypto'
import { copyFile } from 'fs';
const {iotaInit,getMessage} = require('../core/core');
const {trytesToAscii} = require('@iota/converter');
const pow = require('proof-of-work');

const tag = "GADDTCVCPCGDIDGDJDVAUAKDGA9"

const fetchDevices = async provider => {
    try{

        const iota = await iotaInit(provider)
        const options = {tags : [tag]};
        const transactions = await iota.findTransactionObjects(options);

        const devices = [];
        transactions.forEach ( transaction => {
            const device = trytesToAscii(transaction.signatureMessageFragment.substring(0,transactions[0].signatureMessageFragment.length-1));
            try{
                const obj = JSON.parse(device.replace(/\0.*$/g,''));
                if ( obj.name && obj.address && obj.lat && obj.lon ){
                    console.log(obj);
                    devices.push(obj);

                    //PROOF OF WORK
                    const r= checkProofOfWork(obj.prove.proof,obj.prove.complexity,obj.prove.nonce);
                    console.log(r);
                }
            }catch(err){}
        })
            
        //remove devices with same name
        const arrayDeviceName = []
        const newDevices = []
        devices.forEach ( device => {
            if ( !arrayDeviceName.includes(device.name) ){
                arrayDeviceName.push(device.name);
                newDevices.push(device);
            }
        })
        return newDevices;

    }catch(err){
        console.log(err);
        return [];
    }
}



const receiveSideKeyAndFirstRoot = async (provider,account) => {
    try{

        const iota = await iotaInit(provider);
        const options = {
            addresses : account.data.addresses,
            tags : [tag]
        };
        const transactions = await iota.findTransactionObjects(options);
        const res = [];    

        for ( let transaction of transactions ){
            if ( transaction.currentIndex === 0 ){
                try{
                    let message = await getMessage(transaction.hash)//JSON.parse(trytesToAscii(transaction.signatureMessageFragment.substring(0,transaction.signatureMessageFragment.length-1)).replace(/\0.*$/g,''));
                    console.log(message);
                    if ( message.sidekey && message.root ){
                        message.root = decryptWithRsaPrivateKey(message.root,account.marketplace.keys.privateKey);
                        message.sidekey = decryptWithRsaPrivateKey(message.sidekey,account.marketplace.keys.privateKey);
                        res.push(message);
                    }
                }catch(e){}
            }
        }
        return res;

    }catch(err){
        console.log(err);
        return [];
    }
}

const checkProofOfWork = (proof,complexity,nonce) => {
    let buff = new Buffer(nonce, 'base64');  
    console.log(buff);
    let text = buff.toString('ascii');
    console.log(text); 
    const verifier = new pow.Verifier({
        complexity: complexity,
        prefix: Buffer.from(proof,'hex'),
        // nonce validity time (default: one minute)
        /*validity: 60000*/
    });
    const res = verifier.check(buff)
    return res;
}



export {
    fetchDevices,
    receiveSideKeyAndFirstRoot,
}