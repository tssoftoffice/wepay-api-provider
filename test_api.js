async function testApi() {
    try {
        const res = await fetch('http://localhost:3000/api/admin/stats')
        console.log('Status:', res.status)
        if (res.ok) {
            const data = await res.json()
            console.log('Data:', JSON.stringify(data, null, 2))
        } else {
            console.log('Error Text:', await res.text())
        }
    } catch (err) {
        console.error('Fetch Error:', err)
    }
}

testApi()
