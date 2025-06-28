/**
 * 👨‍🎓 EcoLearn Student Portal JavaScript
 * AI-powered learning interface dengan green computing
 */

// Import EcoLearn Shared Libraries
import { 
    initEcoLearn, 
    carbonTracker, 
    apiService, 
    authUtils, 
    config 
} from 'https://adbecolearn.github.io/ecolearn-shared/index.js';

// Initialize EcoLearn
const ecolearn = initEcoLearn({
    carbonTracking: true,
    performanceMonitoring: true,
    debugMode: config.isDevelopment()
});

// Student Portal App Class
class StudentApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentUser = null;
        this.aiModel = 'GPT-4';
        this.chatMessages = [];
        this.isLoading = true;
        this.sidebarCollapsed = false;
        
        this.init();
    }

    /**
     * Initialize student portal app
     */
    async init() {
        try {
            // Check authentication
            await this.checkAuthentication();
            
            // Setup DOM references
            this.setupDOM();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup carbon tracking
            this.setupCarbonTracking();
            
            // Load user data
            await this.loadUserData();
            
            // Initialize dashboard
            this.initializeDashboard();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            carbonTracker.track('student_portal_init', {
                userId: this.currentUser?.id,
                aiModel: this.aiModel
            });
            
            console.log('👨‍🎓 EcoLearn Student Portal initialized');
            
        } catch (error) {
            console.error('Failed to initialize student portal:', error);
            this.handleInitError(error);
        }
    }

    /**
     * Check user authentication
     */
    async checkAuthentication() {
        if (!authUtils.isAuthenticated()) {
            window.location.href = 'https://adbecolearn.github.io/ecolearn-auth/';
            return;
        }
        
        this.currentUser = authUtils.getCurrentUser();
        
        // Verify user role
        if (this.currentUser.role !== 'student') {
            const redirectUrl = authUtils.getRedirectUrl(this.currentUser.role);
            window.location.href = redirectUrl;
            return;
        }
    }

    /**
     * Setup DOM references
     */
    setupDOM() {
        // Loading screen
        this.loadingScreen = document.getElementById('loading-screen');
        this.app = document.getElementById('app');
        
        // Sidebar elements
        this.sidebar = document.querySelector('.sidebar');
        this.sidebarToggle = document.querySelector('.sidebar-toggle');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        // Header elements
        this.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        this.pageTitle = document.getElementById('pageTitle');
        this.aiStatus = document.getElementById('aiStatus');
        this.aiIndicator = document.getElementById('aiIndicator');
        this.notificationsBtn = document.getElementById('notificationsBtn');
        this.notificationBadge = document.getElementById('notificationBadge');
        
        // User profile elements
        this.userInitials = document.getElementById('userInitials');
        this.userName = document.getElementById('userName');
        this.userStudentId = document.getElementById('userStudentId');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        // Page content elements
        this.pageContents = document.querySelectorAll('.page-content');
        
        // Dashboard elements
        this.totalCourses = document.getElementById('totalCourses');
        this.completedAssignments = document.getElementById('completedAssignments');
        this.currentStreak = document.getElementById('currentStreak');
        this.continueLastCourse = document.getElementById('continueLastCourse');
        this.currentAiModel = document.getElementById('currentAiModel');
        this.startAiChat = document.getElementById('startAiChat');
        this.viewRecommendations = document.getElementById('viewRecommendations');
        this.activityList = document.getElementById('activityList');
        this.progressPeriod = document.getElementById('progressPeriod');
        this.overallProgress = document.getElementById('overallProgress');
        this.overallProgressCircle = document.getElementById('overallProgressCircle');
        this.deadlineList = document.getElementById('deadlineList');
        this.sessionCarbon = document.getElementById('sessionCarbon');
        this.totalCarbon = document.getElementById('totalCarbon');
        this.carbonSaved = document.getElementById('carbonSaved');
        
        // Chat elements
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.attachmentBtn = document.getElementById('attachmentBtn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.exportChatBtn = document.getElementById('exportChatBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.chatAiModel = document.getElementById('chatAiModel');
        this.inputAiModel = document.getElementById('inputAiModel');
        
        // Carbon tracker elements
        this.carbonIndicator = document.querySelector('.carbon-indicator');
        this.carbonText = document.querySelector('.carbon-text');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Sidebar navigation
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileSidebar());
        }
        
        // Navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });
        
        // User actions
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        
        if (this.notificationsBtn) {
            this.notificationsBtn.addEventListener('click', () => this.showNotifications());
        }
        
        // Dashboard actions
        if (this.continueLastCourse) {
            this.continueLastCourse.addEventListener('click', () => this.continueLastCourse());
        }
        
        if (this.startAiChat) {
            this.startAiChat.addEventListener('click', () => this.navigateToPage('ai-chat'));
        }
        
        if (this.viewRecommendations) {
            this.viewRecommendations.addEventListener('click', () => this.showRecommendations());
        }
        
        if (this.progressPeriod) {
            this.progressPeriod.addEventListener('change', (e) => this.updateProgressPeriod(e.target.value));
        }
        
        // Chat functionality
        if (this.chatInput) {
            this.chatInput.addEventListener('input', () => this.handleChatInput());
            this.chatInput.addEventListener('keydown', (e) => this.handleChatKeydown(e));
        }
        
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (this.attachmentBtn) {
            this.attachmentBtn.addEventListener('click', () => this.handleAttachment());
        }
        
        if (this.clearChatBtn) {
            this.clearChatBtn.addEventListener('click', () => this.clearChat());
        }
        
        if (this.exportChatBtn) {
            this.exportChatBtn.addEventListener('click', () => this.exportChat());
        }
        
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => this.showChatSettings());
        }
        
        // Suggestion chips
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-chip')) {
                this.handleSuggestionClick(e.target.dataset.suggestion);
            }
        });
        
        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('beforeunload', () => this.handleBeforeUnload());
    }

    /**
     * Setup carbon tracking updates
     */
    setupCarbonTracking() {
        // Update carbon display every 3 seconds
        setInterval(() => {
            this.updateCarbonDisplay();
        }, 3000);
        
        // Initial update
        this.updateCarbonDisplay();
    }

    /**
     * Load user data from API
     */
    async loadUserData() {
        try {
            // Update user profile display
            if (this.currentUser) {
                const initials = `${this.currentUser.firstName[0]}${this.currentUser.lastName[0]}`.toUpperCase();
                
                if (this.userInitials) this.userInitials.textContent = initials;
                if (this.userName) this.userName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
                if (this.userStudentId) this.userStudentId.textContent = this.currentUser.studentId;
            }
            
            // Load dashboard data
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    }

    /**
     * Load dashboard data
     */
    async loadDashboardData() {
        try {
            // Simulate API call for dashboard data
            const dashboardData = {
                totalCourses: 6,
                completedAssignments: 12,
                currentStreak: 7,
                overallProgress: 78,
                sessionCarbon: 0.23,
                totalCarbon: 2.1,
                carbonSaved: 15.7
            };
            
            // Update dashboard displays
            if (this.totalCourses) this.totalCourses.textContent = dashboardData.totalCourses;
            if (this.completedAssignments) this.completedAssignments.textContent = dashboardData.completedAssignments;
            if (this.currentStreak) this.currentStreak.textContent = dashboardData.currentStreak;
            if (this.overallProgress) this.overallProgress.textContent = `${dashboardData.overallProgress}%`;
            if (this.sessionCarbon) this.sessionCarbon.textContent = `${dashboardData.sessionCarbon}g`;
            if (this.totalCarbon) this.totalCarbon.textContent = `${dashboardData.totalCarbon}g`;
            if (this.carbonSaved) this.carbonSaved.textContent = `${dashboardData.carbonSaved}g`;
            
            // Update progress circle
            this.updateProgressCircle(dashboardData.overallProgress);
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    /**
     * Initialize dashboard
     */
    initializeDashboard() {
        // Update AI model displays
        if (this.currentAiModel) this.currentAiModel.textContent = this.aiModel;
        if (this.chatAiModel) this.chatAiModel.textContent = this.aiModel;
        if (this.inputAiModel) this.inputAiModel.textContent = this.aiModel;
        
        // Set AI status
        this.updateAiStatus('online');
        
        // Initialize notifications
        this.updateNotificationBadge(3);
    }

    /**
     * Hide loading screen and show app
     */
    hideLoadingScreen() {
        setTimeout(() => {
            if (this.loadingScreen) {
                this.loadingScreen.classList.add('hidden');
            }
            if (this.app) {
                this.app.style.display = 'flex';
            }
            this.isLoading = false;
        }, 1500);
    }

    /**
     * Handle initialization error
     */
    handleInitError(error) {
        console.error('Initialization error:', error);
        
        // Show error message
        if (this.loadingScreen) {
            const loadingText = this.loadingScreen.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = 'Failed to initialize. Please refresh the page.';
                loadingText.style.color = 'var(--eco-error-600)';
            }
        }
    }

    /**
     * Toggle sidebar collapse
     */
    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
        
        if (this.sidebar) {
            this.sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
        }
        
        carbonTracker.track('sidebar_toggle', {
            collapsed: this.sidebarCollapsed
        });
    }

    /**
     * Toggle mobile sidebar
     */
    toggleMobileSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.toggle('open');
        }
        
        carbonTracker.track('mobile_sidebar_toggle');
    }

    /**
     * Handle navigation between pages
     */
    handleNavigation(e) {
        e.preventDefault();
        
        const link = e.currentTarget;
        const page = link.dataset.page;
        
        if (page && page !== this.currentPage) {
            this.navigateToPage(page);
        }
    }

    /**
     * Navigate to specific page
     */
    navigateToPage(page) {
        // Update current page
        this.currentPage = page;
        
        // Update navigation active state
        this.navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });
        
        // Update page content
        this.pageContents.forEach(content => {
            content.classList.toggle('active', content.id === `${page}-page`);
        });
        
        // Update page title
        const pageTitles = {
            'dashboard': 'Dashboard',
            'ai-chat': 'AI Assistant',
            'courses': 'My Courses',
            'progress': 'Learning Progress',
            'assignments': 'Assignments',
            'resources': 'Resources',
            'calendar': 'Calendar'
        };
        
        if (this.pageTitle) {
            this.pageTitle.textContent = pageTitles[page] || 'EcoLearn';
        }
        
        // Close mobile sidebar
        if (window.innerWidth <= 768 && this.sidebar) {
            this.sidebar.classList.remove('open');
        }
        
        carbonTracker.track('page_navigation', {
            from: this.currentPage,
            to: page
        });
        
        // Page-specific initialization
        if (page === 'ai-chat') {
            this.initializeChat();
        }
    }

    /**
     * Handle user logout
     */
    handleLogout() {
        carbonTracker.track('user_logout', {
            userId: this.currentUser?.id,
            sessionDuration: Date.now() - this.sessionStart
        });

        authUtils.logout();
        window.location.href = 'https://adbecolearn.github.io/ecolearn-home/';
    }

    /**
     * Show notifications
     */
    showNotifications() {
        carbonTracker.track('notifications_opened');

        // TODO: Implement notifications modal
        console.log('Notifications clicked');
    }

    /**
     * Continue last course
     */
    continueLastCourse() {
        carbonTracker.track('continue_last_course');

        // Navigate to courses page
        this.navigateToPage('courses');
    }

    /**
     * Show AI recommendations
     */
    showRecommendations() {
        carbonTracker.track('view_ai_recommendations');

        // TODO: Implement recommendations modal
        console.log('AI recommendations clicked');
    }

    /**
     * Update progress period
     */
    updateProgressPeriod(period) {
        carbonTracker.track('progress_period_change', { period });

        // TODO: Update progress data based on period
        console.log('Progress period changed to:', period);
    }

    /**
     * Update progress circle
     */
    updateProgressCircle(percentage) {
        if (this.overallProgressCircle) {
            const circumference = 2 * Math.PI * 45; // radius = 45
            const offset = circumference - (percentage / 100) * circumference;
            this.overallProgressCircle.style.strokeDashoffset = offset;
        }
    }

    /**
     * Update AI status
     */
    updateAiStatus(status) {
        const statusTexts = {
            'online': 'AI Ready',
            'busy': 'AI Busy',
            'offline': 'AI Offline'
        };

        if (this.aiStatus) {
            this.aiStatus.textContent = statusTexts[status] || 'AI Unknown';
        }

        if (this.aiIndicator) {
            this.aiIndicator.className = 'ai-indicator';
            if (status === 'busy') {
                this.aiIndicator.classList.add('warning');
            } else if (status === 'offline') {
                this.aiIndicator.classList.add('critical');
            }
        }
    }

    /**
     * Update notification badge
     */
    updateNotificationBadge(count) {
        if (this.notificationBadge) {
            this.notificationBadge.textContent = count;
            this.notificationBadge.style.display = count > 0 ? 'block' : 'none';
        }
    }

    /**
     * Initialize chat functionality
     */
    initializeChat() {
        // Focus chat input
        if (this.chatInput) {
            setTimeout(() => this.chatInput.focus(), 100);
        }

        // Load chat history
        this.loadChatHistory();
    }

    /**
     * Load chat history
     */
    loadChatHistory() {
        // TODO: Load chat history from API
        console.log('Loading chat history...');
    }

    /**
     * Handle chat input changes
     */
    handleChatInput() {
        const message = this.chatInput.value.trim();

        // Enable/disable send button
        if (this.sendBtn) {
            this.sendBtn.disabled = !message;
        }

        // Auto-resize textarea
        this.autoResizeTextarea();
    }

    /**
     * Handle chat input keydown
     */
    handleChatKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    /**
     * Auto-resize textarea
     */
    autoResizeTextarea() {
        if (this.chatInput) {
            this.chatInput.style.height = 'auto';
            this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
        }
    }

    /**
     * Send chat message
     */
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Clear input
        this.chatInput.value = '';
        this.handleChatInput();

        // Add user message to chat
        this.addMessageToChat('user', message);

        // Show typing indicator
        this.showTypingIndicator();

        // Track message
        carbonTracker.track('chat_message_sent', {
            messageLength: message.length,
            aiModel: this.aiModel
        });

        try {
            // Send message to AI
            const response = await this.sendMessageToAI(message);

            // Hide typing indicator
            this.hideTypingIndicator();

            // Add AI response to chat
            this.addMessageToChat('ai', response);

        } catch (error) {
            console.error('Failed to send message:', error);

            // Hide typing indicator
            this.hideTypingIndicator();

            // Show error message
            this.addMessageToChat('ai', 'Sorry, I encountered an error. Please try again.');
        }
    }

    /**
     * Send message to AI API
     */
    async sendMessageToAI(message) {
        // Simulate AI response
        await new Promise(resolve => setTimeout(resolve, 1500));

        const responses = [
            "That's a great question! Let me help you understand this concept better.",
            "Based on your current progress in Digital Marketing, I recommend focusing on...",
            "Here's what I found about that topic. Would you like me to explain it in more detail?",
            "I can see you're working on your assignment. Here are some tips to help you succeed.",
            "That's an interesting perspective! Let's explore this further."
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * Add message to chat
     */
    addMessageToChat(sender, message) {
        if (!this.chatMessages) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;

        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageElement.innerHTML = `
            <div class="message-avatar">
                <span class="avatar-icon">${sender === 'ai' ? '🤖' : '👤'}</span>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">${sender === 'ai' ? 'EcoLearn AI' : 'You'}</span>
                    <span class="message-time">${timeString}</span>
                </div>
                <div class="message-text">
                    <p>${message}</p>
                </div>
            </div>
        `;

        this.chatMessages.appendChild(messageElement);

        // Scroll to bottom
        this.scrollChatToBottom();
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.style.display = 'flex';
        }
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.style.display = 'none';
        }
    }

    /**
     * Scroll chat to bottom
     */
    scrollChatToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }

    /**
     * Handle suggestion chip click
     */
    handleSuggestionClick(suggestion) {
        if (this.chatInput) {
            this.chatInput.value = suggestion;
            this.handleChatInput();
            this.chatInput.focus();
        }

        carbonTracker.track('suggestion_clicked', {
            suggestion: suggestion.substring(0, 50)
        });
    }

    /**
     * Handle attachment
     */
    handleAttachment() {
        carbonTracker.track('attachment_clicked');

        // TODO: Implement file attachment
        console.log('Attachment clicked');
    }

    /**
     * Clear chat
     */
    clearChat() {
        if (this.chatMessages) {
            // Keep only the initial AI message
            const initialMessage = this.chatMessages.querySelector('.message.ai-message');
            this.chatMessages.innerHTML = '';
            if (initialMessage) {
                this.chatMessages.appendChild(initialMessage);
            }
        }

        carbonTracker.track('chat_cleared');
    }

    /**
     * Export chat
     */
    exportChat() {
        carbonTracker.track('chat_exported');

        // TODO: Implement chat export
        console.log('Export chat clicked');
    }

    /**
     * Show chat settings
     */
    showChatSettings() {
        carbonTracker.track('chat_settings_opened');

        // TODO: Implement chat settings modal
        console.log('Chat settings clicked');
    }

    /**
     * Update carbon footprint display
     */
    updateCarbonDisplay() {
        const metrics = carbonTracker.getMetrics();
        const budget = carbonTracker.getCarbonBudget();

        // Update carbon text
        const carbonValue = `${metrics.totalCarbonGrams.toFixed(3)}g CO2`;

        if (this.carbonText) {
            this.carbonText.textContent = carbonValue;
        }

        // Update session carbon in dashboard
        if (this.sessionCarbon) {
            this.sessionCarbon.textContent = `${metrics.sessionCarbonGrams.toFixed(2)}g`;
        }

        // Update carbon indicator color
        if (this.carbonIndicator) {
            this.carbonIndicator.className = 'carbon-indicator';
            if (budget.status === 'warning') {
                this.carbonIndicator.classList.add('warning');
            } else if (budget.status === 'critical') {
                this.carbonIndicator.classList.add('critical');
            }
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Close mobile sidebar on desktop
        if (window.innerWidth > 768 && this.sidebar) {
            this.sidebar.classList.remove('open');
        }

        carbonTracker.track('window_resize', {
            width: window.innerWidth,
            height: window.innerHeight
        });
    }

    /**
     * Handle before unload
     */
    handleBeforeUnload() {
        carbonTracker.track('session_end', {
            userId: this.currentUser?.id,
            currentPage: this.currentPage,
            sessionDuration: Date.now() - (this.sessionStart || Date.now())
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StudentApp();
});

// Also initialize immediately for module loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new StudentApp();
    });
} else {
    new StudentApp();
}
