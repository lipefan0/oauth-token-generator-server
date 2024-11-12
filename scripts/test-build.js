// scripts/test-build.js
import { exec } from 'child_process';
import { promisify } from 'util';
import net from 'net';

const execAsync = promisify(exec);

async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
}

async function killProcessOnPort(port) {
  try {
    if (process.platform === 'win32') {
      await execAsync(`netstat -ano | findstr :${port}`).then(async ({ stdout }) => {
        const pid = stdout.split(' ').filter(Boolean).pop();
        if (pid) {
          await execAsync(`taskkill /F /PID ${pid}`);
        }
      });
    } else {
      await execAsync(`lsof -i :${port} -t | xargs kill -9`);
    }
    console.log(`✅ Porta ${port} liberada`);
  } catch (error) {
    console.log(`Nenhum processo encontrado na porta ${port}`);
  }
}

async function testBuild() {
  const PORT = process.env.PORT || 8080;
  
  try {
    console.log('🚀 Iniciando teste de build...\n');

    // Verificar e liberar porta
    console.log(`🔍 Verificando porta ${PORT}...`);
    if (await isPortInUse(PORT)) {
      console.log(`⚠️ Porta ${PORT} em uso. Tentando liberar...`);
      await killProcessOnPort(PORT);
      // Aguardar um momento para garantir que a porta foi liberada
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Instalar dependências
    console.log('📦 Instalando dependências...');
    const installResult = await execAsync('npm install');
    console.log('✅ Dependências instaladas\n');

    // Testar inicialização
    console.log('🚀 Iniciando servidor de teste...');
    const serverProcess = exec('npm start');
    
    let hasError = false;
    
    // Aguardar servidor iniciar
    await new Promise((resolve, reject) => {
      serverProcess.stdout.on('data', (data) => {
        console.log(data.toString().trim());
        if (data.includes('Servidor rodando')) {
          resolve();
        }
      });

      serverProcess.stderr.on('data', (data) => {
        console.error(data.toString().trim());
        hasError = true;
        reject(new Error(data.toString()));
      });

      // Timeout após 30 segundos
      setTimeout(() => {
        reject(new Error('Timeout ao iniciar servidor'));
      }, 30000);
    });

    if (hasError) {
      throw new Error('Erro ao iniciar servidor');
    }

    console.log('\n✅ Servidor iniciado com sucesso');

    // Testar health check
    console.log('\n🏥 Testando health check...');
    const response = await fetch(`http://localhost:${PORT}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check falhou com status ${response.status}`);
    }
    
    const health = await response.json();
    console.log('Health check response:', health);

    // Encerrar servidor
    console.log('\n🛑 Encerrando servidor...');
    await killProcessOnPort(PORT);
    
    console.log('\n✨ Teste completado com sucesso!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erro no teste:', error);
    // Tentar matar qualquer processo que possa ter ficado
    try {
      await killProcessOnPort(PORT);
    } catch {}
    process.exit(1);
  }
}

testBuild();