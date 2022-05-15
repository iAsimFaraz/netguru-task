const request = require('request')

const savedMoviesData = []

const create = async (req, res) => {
    const { title } = req.body
    const { userId, role } = req.user
    let existingUser = savedMoviesData.find(x => x.userId === userId)
    if (existingUser && role === 'basic' && existingUser.savedMovies.length === 5) {
        res.status(200).json({ message: 'You have the limit for 5 movies' })
        return
    }

    const response = await getMoviesData(title)
    if (response.status === 'success') {
        const { Title, Genre, Director, Released } = response.data
        let obj = {
            Title,
            Genre,
            Director,
            Released
        }
        if (existingUser) {
            let index = savedMoviesData.findIndex(x => x.userId == userId)
            savedMoviesData[index] = {
                ...existingUser,
                savedMovies: [...existingUser.savedMovies, obj]
            }

        } else {
            let objToSave = {
                ...req.user,
                savedMovies: [obj]
            }
            savedMoviesData.push(objToSave)
        }
        res.status(200).json({
            status: 'success',
            data: savedMoviesData.filter(data => data.userId === userId)
        })
    } else {
        res.status(400).json({ message: 'something went wrong' })
    }
}

const get = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: savedMoviesData.filter(data => data.userId === req.user.userId)
    })
}



const getMoviesData = async (title) => {
    return new Promise(async (resolve, reject) => {
        request.get(
            `http://www.omdbapi.com/?apikey=be7d44a0&t=${title}`,
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    response = {
                        status: 'success',
                        data: JSON.parse(body)
                    }
                    resolve(response)
                }

                response = {
                    status: 'failed'
                }
                reject(response)
            }
        );
    })
}

module.exports = {
    create,
    get
}