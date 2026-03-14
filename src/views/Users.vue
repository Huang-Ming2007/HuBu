<template>
  <div class="users">
    <h2 class="page-title">用户管理</h2>
    
    <!-- 用户列表 -->
    <div class="card scroll-menu">
      <h3>官员列表</h3>
      <table class="users-table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>姓名</th>
            <th>官职</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.username }}</td>
            <td>{{ user.name }}</td>
            <td>{{ formatRole(user.role) }}</td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <button class="btn small-btn" @click="editUser(user)">编辑</button>
              <button class="btn small-btn delete-btn" @click="deleteUser(user.id)" v-if="user.role !== 'minister'">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 添加/编辑用户 -->
    <div class="card">
      <h3>{{ isEditing ? '编辑官员' : '添加官员' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="form-group">
            <label for="username">用户名</label>
            <input type="text" id="username" v-model="userForm.username" class="input" required />
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input type="password" id="password" v-model="userForm.password" class="input" :required="!isEditing" />
          </div>
          <div class="form-group">
            <label for="name">姓名</label>
            <input type="text" id="name" v-model="userForm.name" class="input" required />
          </div>
          <div class="form-group">
            <label for="role">官职</label>
            <select id="role" v-model="userForm.role" class="input" required>
              <option value="minister">户部尚书</option>
              <option value="vice_minister">户部侍郎</option>
              <option value="clerk">主事</option>
            </select>
          </div>
          <div class="form-group full-width">
            <button type="submit" class="btn">{{ isEditing ? '更新' : '添加' }}</button>
            <button type="button" class="btn" @click="resetForm">重置</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { mockUsers, Role, User } from '../types/user';

// 用户列表
const users = ref<User[]>([...mockUsers]);

// 用户表单
const userForm = ref({
  id: '',
  username: '',
  password: '',
  name: '',
  role: Role.CLERK
});

// 是否正在编辑
const isEditing = ref(false);

// 格式化角色
const formatRole = (role: Role) => {
  const roleMap = {
    [Role.WUYING_SCHOLAR]: '武英殿大学士',
    [Role.MINISTER]: '户部尚书',
    [Role.VICE_MINISTER_LEFT]: '户部左侍郎',
    [Role.VICE_MINISTER_RIGHT]: '户部右侍郎',
    [Role.CLERK]: '主事'
  };
  return roleMap[role];
};

// 格式化日期
const formatDate = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  return date.toLocaleDateString('zh-CN');
};

// 编辑用户
const editUser = (user: User) => {
  userForm.value = { ...user };
  isEditing.value = true;
};

// 删除用户
const deleteUser = (id: string) => {
  if (confirm('确定要删除这个官员吗？')) {
    users.value = users.value.filter((user: User) => user.id !== id);
  }
};

// 提交表单
const handleSubmit = () => {
  if (isEditing.value) {
    // 更新用户
    const index = users.value.findIndex((user: User) => user.id === userForm.value.id);
    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        ...userForm.value
      };
    }
  } else {
    // 添加用户
    const newUser: User = {
      ...userForm.value,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    users.value.push(newUser);
  }
  resetForm();
};

// 重置表单
const resetForm = () => {
  userForm.value = {
    id: '',
    username: '',
    password: '',
    name: '',
    role: Role.CLERK
  };
  isEditing.value = false;
};

onMounted(() => {
  // 实际项目中这里会从API获取用户数据
});
</script>

<style scoped>
.users {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
}

.users-table {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.full-width {
  grid-column: 1 / -1;
  display: flex;
  gap: 1rem;
}

.small-btn {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.delete-btn {
  background-color: #dc3545;
}

.delete-btn:hover {
  background-color: #c82333;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .full-width {
    flex-direction: column;
  }
  
  .users-table {
    font-size: 0.9rem;
  }
  
  th, td {
    padding: 0.5rem;
  }
}
</style>