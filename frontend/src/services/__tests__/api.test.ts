describe('API Service', () => {
  it('should handle login', async () => {
    const res = await api.login({
      username: 'test',
      password: 'test'
    })
    expect(res.success).toBe(true)
  })
}) 