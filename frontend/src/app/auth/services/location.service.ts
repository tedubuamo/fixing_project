import { api } from '@/services/api'
import type { Region, Branch, Cluster, Area } from '../types'

export const locationService = {
  getAreas: async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/areas/`, {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch areas')
      }
      
      return data as Area[]
    } catch (error) {
      console.error('Error fetching areas:', error)
      throw error
    }
  },

  getRegions: async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/regions/`, {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch regions')
      }
      
      return data as Region[]
    } catch (error) {
      console.error('Error fetching regions:', error)
      throw error
    }
  },

  getBranches: async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/branches/`, {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch branches')
      }
      
      return data as Branch[]
    } catch (error) {
      console.error('Error fetching branches:', error)
      throw error
    }
  },

  getClusters: async (branchId: string) => {
    try {
      console.log('Fetching clusters for branch:', branchId)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/locations/clusters/${branchId}`,
        {
          credentials: 'include'
        }
      )
      
      if (!response.ok) {
        throw new Error(`Failed to fetch clusters: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Clusters data:', data)
      
      return data
    } catch (error) {
      console.error('Error fetching clusters:', error)
      throw error
    }
  }
}

export async function getLocationHierarchy(areaId?: number) {
  try {
    // Get Areas
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hierarchy/areas`, {
      credentials: 'include'
    })
    const areas = await response.json()

    if (!areaId && areas?.length) {
      areaId = areas[0].id_area
    }

    // Get Regions for Area
    const regionsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/hierarchy/regions/${areaId}`, {
        credentials: 'include'
      }
    )
    const regions = await regionsResponse.json()

    return {
      areas: areas || [],
      regions: regions || [],
      selectedArea: areaId
    }
  } catch (error) {
    console.error('Error fetching hierarchy:', error)
    throw error
  }
}

export async function getRegionHierarchy(regionId: number) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/hierarchy/branches/${regionId}`, {
        credentials: 'include'
      }
    )
    const data = await response.json()

    return {
      branches: data || []
    }
  } catch (error) {
    console.error('Error fetching region hierarchy:', error)
    throw error
  }
}

export async function getBranchClusters(branchId: number) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/hierarchy/clusters/${branchId}`, {
        credentials: 'include'
      }
    )
    const data = await response.json()

    return {
      clusters: data || []
    }
  } catch (error) {
    console.error('Error fetching branch clusters:', error)
    throw error
  }
} 