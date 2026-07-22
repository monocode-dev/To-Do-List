const express = require("express");
const db = require('./database');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/api/tasks', (req, res) =>{
    const selectALL = db.prepare('SELECT * FROM tasks').all();
    res.json(selectALL);
});

app.get('/api/tasks/:id', (req, res) =>{
    const selectOne = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);

    if(!selectOne){
        return res.status(404).json({
            success: false,
            message: 'Invalid id'
        });
    }

    res.json({
        success: true,
        data: selectOne
    });
});

app.post('/api/tasks', (req, res) => {
    if(!req.body.title || req.body.title.trim() === ''){
        return res.status(400).json({
            success: false,
            message: 'Enter a Valid Task'
        });
    };

    const insert = db.prepare('INSERT INTO tasks (title) VALUES (?)').run(req.body.title);

    res.json({
        success: true,
        message: 'Task Added Succesfully',
        taskID: insert.lastInsertRowid
    });
});

app.delete('/api/tasks/:id', (req, res) => {
    const deleteTask = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id)

    if(deleteTask.changes === 0){
        return res.status(404).json({
            success: false,
            message: 'Invalid Id'
        })
    }

    res.json({
        success: true,
        message: 'Task Deleted Succesfully'
    });
});

app.put('/api/tasks/:id', (req, res) => {
    if(!req.body.status || req.body.status.trim() === ''){
        return res.status(400).json({
            success: false,
            message: 'Invalid status'
        })
    }

    const updateStatus = db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(req.body.status, req.params.id)

    if(updateStatus.changes === 0){
        return res.status(404).json({
            success: false,
            message: 'Invalid Id'
        })
    }

    res.json({
        success: true,
        message: 'Status Updated Succesfully'
    });
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});