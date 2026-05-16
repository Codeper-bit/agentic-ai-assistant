
interface ChatMessage {
    role: 'user' | 'ai';
    text: string;
    time: string;
}

interface ChatHistoryItem {
    id: string;
    preview: string;
    messages: ChatMessage[];
}

(function () {
    let sessionId: string = 'session_' + Date.now();
    let chatHistory: ChatHistoryItem[] = [];
    let currentMessages: ChatMessage[] = [];
    let isLoading: boolean = false;

    const suggestions: string[] = [
        'Explain AI in simple terms',
        'What is machine learning?',
        'Help me debug my code',
        'What is prompt engineering?',
        'How do AI agents work?',
        'What can you do?'
    ];

    const chatbox = document.getElementById('chatbox') as HTMLDivElement;
    const askchat = document.getElementById('askchat') as HTMLTextAreaElement;
    const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;
    const historyList = document.getElementById('history-list') as HTMLDivElement;
    const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
    const welcome = document.getElementById('welcome') as HTMLDivElement;
    const menuBtn = document.getElementById('menu-btn') as HTMLButtonElement;
    const sidebar = document.getElementById('sidebar') as HTMLDivElement;
    const newChatBtn = document.getElementById('new-chat-btn') as HTMLButtonElement;
    const newChatBtn2 = document.getElementById('new-chat-btn2') as HTMLButtonElement;
    const suggestionChips = document.getElementById('suggestion-chips') as HTMLDivElement;

    function init() {
        try {
            const stored = localStorage.getItem('nova_history');
            if (stored) {
                chatHistory = JSON.parse(stored);
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }

        renderChips();
        renderHistory();
        setupEventListeners();
    }

    function setupEventListeners() {
        // Welcome button
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                welcome.classList.add('hide');
                setTimeout(() => { welcome.style.display = 'none'; }, 800);
            });
        }

        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        if (newChatBtn) newChatBtn.addEventListener('click', newChat);
        if (newChatBtn2) newChatBtn2.addEventListener('click', newChat);

        if (sendBtn) sendBtn.addEventListener('click', sendMessage);

        if (askchat) {
            askchat.addEventListener('keydown', (e: KeyboardEvent) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            askchat.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });
        }
    }

    function renderChips() {
        if (!suggestionChips) return;
        suggestionChips.innerHTML = '';
        suggestions.forEach((s) => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.textContent = s;
            chip.addEventListener('click', () => suggest(s));
            suggestionChips.appendChild(chip);
        });
    }

    function suggest(text: string) {
        if (askchat) {
            askchat.value = text;
            sendMessage();
        }
    }

    function getTime(): string {
        const d = new Date();
        let h = d.getHours();
        let m: string | number = d.getMinutes();
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12;
        m = m < 10 ? '0' + m : m;
        return `${h}:${m} ${ampm}`;
    }

    function formatText(text: string): string {
        const parts = text.split('**');
        let result = '';
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 1) {
                result += '<strong>' + parts[i] + '</strong>';
            } else {
                result += parts[i];
            }
        }
        result = result.split('\n').join('<br>');
        return result;
    }

    function getEmptyHTML(): string {
        return `
            <div class="empty" id="empty-state">
                <div class="empty-icon">✧</div>
                <div class="empty-title">What can I help you with?</div>
                <p style="font-size:0.84rem;">Ask me anything. I remember our entire conversation.</p>
                <div class="chips" id="suggestion-chips"></div>
            </div>`;
    }

    function appendMessage(role: 'user' | 'ai', text: string, time: string, animate: boolean = true) {
        const empty = document.getElementById('empty-state');
        if (empty) empty.remove();

        const isUser = role === 'user';
        const div = document.createElement('div');
        div.className = 'msg-row ' + (isUser ? 'user' : 'ai');
        if (!animate) div.style.animation = 'none';

        div.innerHTML = `
            <div class="avatar ${isUser ? 'user' : 'ai'}">${isUser ? '👤' : '🤖'}</div>
            <div>
                <div class="bubble ${isUser ? 'user' : 'ai'}">${formatText(text)}</div>
                <span class="msg-time">${time}</span>
            </div>`;

        chatbox.appendChild(div);
        chatbox.scrollTop = chatbox.scrollHeight;
        return div;
    }

    function showLoading() {
        const div = document.createElement('div');
        div.className = 'msg-row ai';
        div.id = 'loading-row';
        div.innerHTML = `
            <div class="avatar ai">🤖</div>
            <div><div class="bubble ai"><div class="dots"><span></span><span></span><span></span></div></div></div>`;
        chatbox.appendChild(div);
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    function removeLoading() {
        const el = document.getElementById('loading-row');
        if (el) el.remove();
    }

    function saveHistory() {
        if (currentMessages.length === 0) return;

        let preview = currentMessages[0].text.substring(0, 45);
        if (currentMessages[0].text.length > 45) preview += '...';

        const entry: ChatHistoryItem = { id: sessionId, preview: preview, messages: [...currentMessages] };

        const existingIdx = chatHistory.findIndex(item => item.id === sessionId);
        if (existingIdx >= 0) {
            chatHistory[existingIdx] = entry;
        } else {
            chatHistory.unshift(entry);
            if (chatHistory.length > 20) chatHistory.pop();
        }

        try {
            localStorage.setItem('nova_history', JSON.stringify(chatHistory));
        } catch (e) {
            console.error("Failed to save history", e);
        }
        renderHistory();
    }

    function renderHistory() {
        if (!historyList) return;

        if (chatHistory.length === 0) {
            historyList.innerHTML = '<div style="padding:20px;font-size:0.8rem;color:var(--text2);text-align:center;">No chats yet</div>';
            return;
        }

        historyList.innerHTML = '';
        chatHistory.forEach((item, i) => {
            const div = document.createElement('div');
            div.className = 'h-item' + (item.id === sessionId ? ' active' : '');
            div.textContent = '💬 ' + item.preview;
            div.addEventListener('click', () => loadHistory(i));
            historyList.appendChild(div);
        });
    }

    function loadHistory(index: number) {
        saveHistory();
        const entry = chatHistory[index];
        sessionId = entry.id;
        currentMessages = [...entry.messages];

        chatbox.innerHTML = '';
        currentMessages.forEach((msg) => {
            appendMessage(msg.role, msg.text, msg.time, false);
        });

        renderHistory();
        if (window.innerWidth <= 768) sidebar.classList.remove('open');
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    function newChat() {
        saveHistory();
        sessionId = 'session_' + Date.now();
        currentMessages = [];

        chatbox.innerHTML = getEmptyHTML();
        // Re-render chips because we just cleared the innerHTML of chatbox which contained the chips container
        const newChipsContainer = document.getElementById('suggestion-chips') as HTMLDivElement;
        if (newChipsContainer) {
            suggestions.forEach((s) => {
                const chip = document.createElement('div');
                chip.className = 'chip';
                chip.textContent = s;
                chip.addEventListener('click', () => suggest(s));
                newChipsContainer.appendChild(chip);
            });
        }

        renderHistory();
        if (window.innerWidth <= 768) sidebar.classList.remove('open');
    }

    async function sendMessage() {
        if (isLoading || !askchat) return;

        const text = askchat.value.trim();
        if (!text) return;

        isLoading = true;
        askchat.value = '';
        askchat.style.height = 'auto';
        if (sendBtn) sendBtn.disabled = true;

        const time = getTime();
        appendMessage('user', text, time, true);
        currentMessages.push({ role: 'user', text: text, time: time });
        showLoading();

        try {
            const response = await fetch('http://localhost:8000/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, message: text })
            });

            const data = await response.json();
            removeLoading();

            if (data.reply) {
                const replyTime = getTime();
                appendMessage('ai', data.reply, replyTime, true);
                currentMessages.push({ role: 'ai', text: data.reply, time: replyTime });
                saveHistory();
            } else {
                appendMessage('ai', 'Something went wrong: ' + (data.error || 'Unknown error'), getTime(), true);
            }
        } catch (err) {
            removeLoading();
            appendMessage('ai', 'Cannot connect to NOVA. Is the server running?', getTime(), true);
            console.error(err);
        }

        isLoading = false;
        if (sendBtn) sendBtn.disabled = false;
        askchat.focus();
    }

    init();
})();
