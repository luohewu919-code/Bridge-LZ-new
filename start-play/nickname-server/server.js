const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DATA_FILE = './data.json';

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ nickname: '' }));
}

app.get('/api/nickname', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json({ success: true, nickname: data.nickname });
});

app.post('/api/nickname', (req, res) => {
    const { nickname } = req.body;
    if (!nickname || nickname.trim() === '') {
        return res.status(400).json({ success: false, message: '昵称不能为空' });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify({ nickname: nickname.trim() }));
    res.json({ success: true, message: '昵称已保存', nickname });
});

app.listen(PORT, () => {
    console.log(`✅ 后端服务已启动: http://localhost:${PORT}`);
});