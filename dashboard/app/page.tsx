'use client'

import { useEffect, useState } from 'react'
import { Package, DollarSign, Users, ShoppingCart, TrendingUp, Activity } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
)

interface Stats {
  totalProducts: number
  totalSales: number
  totalRevenue: number
  activeProducts: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    activeProducts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      // Buscar produtos
      const { data: products } = await supabase
        .from('products')
        .select('*')

      // Buscar transações
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'completed')

      const totalRevenue = transactions?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0

      setStats({
        totalProducts: products?.length || 0,
        totalSales: transactions?.length || 0,
        totalRevenue,
        activeProducts: products?.filter(p => p.is_active).length || 0
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-discord-blurple to-discord-fuchsia bg-clip-text text-transparent">
            Discord Sales Bot Dashboard
          </h1>
          <p className="text-gray-400">Gerencie suas vendas e produtos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Produtos"
            value={stats.totalProducts}
            icon={<Package className="w-8 h-8" />}
            color="bg-discord-blurple"
            loading={loading}
          />
          <StatCard
            title="Produtos Ativos"
            value={stats.activeProducts}
            icon={<Activity className="w-8 h-8" />}
            color="bg-discord-green"
            loading={loading}
          />
          <StatCard
            title="Total de Vendas"
            value={stats.totalSales}
            icon={<ShoppingCart className="w-8 h-8" />}
            color="bg-discord-yellow"
            loading={loading}
          />
          <StatCard
            title="Receita Total"
            value={`R$ ${stats.totalRevenue.toFixed(2)}`}
            icon={<DollarSign className="w-8 h-8" />}
            color="bg-discord-fuchsia"
            loading={loading}
          />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InfoCard
            title="🚀 Começando"
            description="Para usar o dashboard, você precisa:"
            items={[
              'Configurar as variáveis de ambiente',
              'Conectar seu bot ao Discord',
              'Configurar o Supabase',
              'Instalar dependências com npm install'
            ]}
          />
          <InfoCard
            title="📚 Recursos"
            description="Funcionalidades disponíveis:"
            items={[
              'Gerenciamento de produtos',
              'Estatísticas em tempo real',
              'Histórico de transações',
              'Sistema de cupons de desconto',
              'Logs de atividades'
            ]}
          />
        </div>

        {/* Quick Links */}
        <div className="mt-8 bg-discord-darker rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">🔗 Links Rápidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickLink
              title="Documentação"
              description="Leia o README.md"
              href="#"
            />
            <QuickLink
              title="Supabase"
              description="Acesse seu painel"
              href="https://supabase.com"
            />
            <QuickLink
              title="Discord Developer"
              description="Portal de desenvolvedores"
              href="https://discord.com/developers"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon, 
  color, 
  loading 
}: { 
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  loading: boolean
}) {
  return (
    <div className="bg-discord-darker rounded-lg p-6 border border-gray-700 hover:border-discord-blurple transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold">
        {loading ? '...' : value}
      </p>
    </div>
  )
}

function InfoCard({ 
  title, 
  description, 
  items 
}: { 
  title: string
  description: string
  items: string[]
}) {
  return (
    <div className="bg-discord-darker rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-400 mb-4">{description}</p>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            <span className="text-discord-blurple mr-2">✓</span>
            <span className="text-gray-300">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function QuickLink({ 
  title, 
  description, 
  href 
}: { 
  title: string
  description: string
  href: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-discord-dark rounded-lg p-4 border border-gray-700 hover:border-discord-blurple transition-colors"
    >
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </a>
  )
}
