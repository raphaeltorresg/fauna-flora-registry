import Arweave from 'arweave/web';
import moment from 'moment'

const arweaveNode = Arweave.init({
    host: 'arweave.net',
    port: 443,           
    protocol: 'https',
    timeout: 70000,
    logging: false,
});

const readWallet = (wallet) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reader.abort()
        reject()
      }
      reader.onload = () => resolve(JSON.parse(reader.result))
      reader.readAsText(wallet)
    })
}

    const readImage = (image) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => {
            reader.abort()
            reject()
          }
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(image)
        })
    }


const getArweaveUser = async(walletFile) =>{
    return new Promise(async (resolve, reject) => {
        try{
            const wallet = await readWallet(walletFile)
            const address = await arweaveNode.wallets.jwkToAddress(wallet)
            const winstonBalance =  await arweaveNode.wallets.getBalance(address)
            const arweaveBalance = await arweaveNode.ar.winstonToAr(winstonBalance)
            const history = await getUserHistory(address)
            resolve({ wallet, address, winstonBalance, arweaveBalance, history })
        }catch(err){
            console.log(err)
            reject(err)
        }
    })
}

const generateNewTransaction = async(type, specie, image, location, history, userWallet) => {
    return new Promise(async (resolve, reject) => {
        try{
            const data = JSON.stringify({ image, location, history })
            let transaction = await arweaveNode.createTransaction({data}, userWallet)
            await transaction.addTag('app', 'faunaflora-reg');
            await transaction.addTag('reg-type', type);
            await transaction.addTag('specie', specie);
            await arweaveNode.transactions.sign(transaction, userWallet)
            resolve(transaction)
        }catch(err){
            reject(err)
        }
    })
}

const generateNewComment = async(comment, transactionHash, userWallet) => {
    return new Promise(async (resolve, reject) => {
        try{
            const data = JSON.stringify({ comment })
            let transaction = await arweaveNode.createTransaction({data}, userWallet)
            await transaction.addTag('app', 'fauna-flora-comment')
            await transaction.addTag('id', transactionHash)
            await arweaveNode.transactions.sign(transaction, userWallet)
            resolve(transaction)
        }catch(err){
            reject(err)
        }
    })
}


const sendArweaveTransaction = async(transaction) => {
    return new Promise(async (resolve, reject) => {
        try{
            await arweaveNode.transactions.post(transaction)
            resolve(transaction.id)
        }catch(err){
            reject(err)
        }
    })
}

const getUserHistory = async(arweaveAddress) => {
    try{
      const query = {
        op: 'and',
        expr1: {
            op: 'equals',
            expr1: 'from',
            expr2: arweaveAddress
        },
        expr2: {
            op: 'equals',
            expr1: 'app',
            expr2: 'faunaflora-reg'
        }     
      }
      let result = []
      const transactions = await arweaveNode.arql(query);
      if(transactions.length === 0){
        return []
      }else{
        for (let x of transactions){
            const data = await getTransactionData(x)
            result.push(data)
        }
      }
      return result
    }catch(err){
      console.log(err)
      return []
    }  
}

const getFaunaSpecies = async() => {
    try{
        const query = {
            op: 'and',
            expr1: {
                op: 'equals',
                expr1: 'reg-type',
                expr2: 'fauna'
            },
            expr2: {
                op: 'equals',
                expr1: 'app',
                expr2: 'faunaflora-reg'
            }     
          }
      let result = []
      const transactions = await arweaveNode.arql(query);
      if(transactions.length === 0){
        return []
      }else{
        for (let x of transactions){
            const data = await getOnlySpecie(x)
            result.push(data)
        }
      }
      return result
    }catch(err){
      console.log(err)
      return []
    }  
}

const getFloraSpecies = async() => {
    try{
        const query = {
            op: 'and',
            expr1: {
                op: 'equals',
                expr1: 'reg-type',
                expr2: 'flora'
            },
            expr2: {
                op: 'equals',
                expr1: 'app',
                expr2: 'faunaflora-reg'
            }     
          }
      let result = []
      const transactions = await arweaveNode.arql(query);
      if(transactions.length === 0){
        return []
      }else{
        for (let x of transactions){
            const data = await getOnlySpecie(x)
            result.push(data)
        }
      }
      return result
    }catch(err){
      console.log(err)
      return []
    }  
}


const getComments = async(transactionId) => {
    try{
        const query = {
            op: 'and',
            expr1: {
                op: 'equals',
                expr1: 'id',
                expr2: transactionId
            },
            expr2: {
                op: 'equals',
                expr1: 'app',
                expr2: 'fauna-flora-comment'
            }     
          }
      let result = []
      const transactions = await arweaveNode.arql(query);
      if(transactions.length === 0){
        return []
      }else{
        for (let x of transactions){
            const data = await getCommentData(x)
            result.push(data)
        }
      }
      return result
    }catch(err){
      console.log(err)
      return []
    }  
}

const getTransactionData = async(transactionId) => {
    return new Promise(async (resolve, reject) => {
        try{
            const transaction = await arweaveNode.transactions.get(transactionId)
            let data = await JSON.parse(transaction.get('data', {decode: true, string: true}))
            let tags =  await transaction.get('tags')
            let specie = await Buffer.from(tags[2].value, 'base64').toString('ascii')
            data.transactionId = transactionId
            data.specie = specie
            resolve(data)
        }catch(err){
            reject(err)
        }
    })
}


const getCommentData = async(transactionId) => {
    return new Promise(async (resolve, reject) => {
        try{
            const transaction = await arweaveNode.transactions.get(transactionId)
            let data = await JSON.parse(transaction.get('data', {decode: true, string: true}))
            data.transactionIdComment = transactionId
            data.sender = await arweaveNode.wallets.ownerToAddress(transaction.owner)
            resolve(data)
        }catch(err){
            reject(err)
        }
    })
}

const getOnlySpecie = async(transactionId) => {
    return new Promise(async (resolve, reject) => {
        try{
            const transaction = await arweaveNode.transactions.get(transactionId)
            const tags =  await transaction.get('tags')
            const specie = await Buffer.from(tags[2].value, 'base64').toString('ascii')
            resolve({ specie, transactionId })
        }catch(err){
            reject(err)
        }
    })
}


export{
    arweaveNode,
    getArweaveUser,
    generateNewTransaction,
    sendArweaveTransaction,
    getUserHistory,
    getTransactionData,
    readImage,
    getFloraSpecies,
    getFaunaSpecies,
    generateNewComment,
    getComments
}