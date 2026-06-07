const response = (res,statusCode,message,data={}) =>{
    if(!res) {
        console.log(message);
        return;
    }

    const responseObject = {
        status:statusCode < 400 ? 'sucess':'error',
        message,
        data
    }
}

module.export = response;