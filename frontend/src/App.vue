<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="app-title">
            <el-icon class="logo-icon"><OfficeBuilding /></el-icon>
            加盟商申请管理系统
          </h1>
          <span class="app-subtitle">总部管理后台</span>
          <nav class="app-nav">
            <router-link
              to="/applications"
              class="nav-item"
              :class="{ active: route.meta.activeMenu === 'applications' || route.path.startsWith('/applications/') }"
            >
              <el-icon><Document /></el-icon>
              <span>申请管理</span>
            </router-link>
            <router-link
              to="/stores"
              class="nav-item"
              :class="{ active: route.meta.activeMenu === 'stores' }"
            >
              <el-icon><Shop /></el-icon>
              <span>门店管理</span>
            </router-link>
          </nav>
        </div>
        <div class="header-right">
          <span class="admin-tag">
            <el-icon><User /></el-icon>
            管理员
          </span>
        </div>
      </div>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { OfficeBuilding, User, Document, Shop } from '@element-plus/icons-vue';

const route = useRoute();
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  padding: 0 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  min-height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.app-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 22px;
}

.app-subtitle {
  font-size: 12.5px;
  opacity: 0.85;
  padding-left: 14px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}

.app-nav {
  display: flex;
  gap: 4px;
  margin-left: 12px;
  padding-left: 20px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(6px);
}

.admin-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  backdrop-filter: blur(6px);
}

.app-main {
  flex: 1;
  padding: 24px 32px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .app-header {
    padding: 12px 20px;
  }
  .app-main {
    padding: 16px 20px;
  }
  .app-subtitle {
    display: none;
  }
  .app-nav {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    width: 100%;
    justify-content: center;
  }
}
</style>
