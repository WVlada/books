const email = (token) =>
{
    let html = `
    <table style="background-color: #ecf0f5;width: 100%; font-family: Arial sans-serif;padding:10 0">
    <tbody style="width:500; background-image: -webkit-linear-gradient(top, #fff9e8 0%, #d8d9ea 100%);display: block !important;max-width: 600px !important;margin: 0 auto !important;clear: both !important;">
<tr>
        
        <td>
            <div style="display: block;padding: 20px;text-align:center">
                <h2 style="color:#49435b">Welcome to FinBooks!</h2>
            </div>
	</td>
</tr>
<tr>
	<td style="color:#49435b;padding:10px">
		Thank you for registering at FinBooks.com! In order to proceed to application, we need to confirm this email adress.
	</td>

</tr>
                                    
                                <tr>
                                    <td style="color:#49435b;padding:10px">
                                        Please confirm your email address by clicking the link below:
                                    </td>
                                </tr>
				<tr>
                                    <td style="color:#49435b;padding:10px">
                                        
                                    </td>
                                </tr>
				<tr>
                                    <td style="color:#49435b;padding:10px">
                                        
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="http://localhost:3000/confirm-email/${token}" style="color:white;background-color: #767688;border: 1px solid rgb(118, 118, 136);border-width: 10px 20px;">Confirm email address</a>
                                    </td>
                                </tr>
				<tr>
                                    <td style="color:#49435b;padding:10px">
                                        
                                    </td>
                                </tr>
                   
</tbody>
</table>
                <div style="margin-top:20px;text-align: center;">
                    
                            <p style="padding:10px; color: #999; font-size: 12px;" >Follow <a style="color:#49435b" href="#">@FinBooks</a> on Twitter.
			</p>
                        
                    
                </div>
`
    return html
}
module.exports =  email;